const MDCSelect = mdc.select.MDCSelect;
const MDCDialog = mdc.dialog.MDCDialog;
const MDCSnackbar = mdc.snackbar.MDCSnackbar;
const MDCDataTable = mdc.dataTable.MDCDataTable;
const MDCSwitch = mdc.switchControl.MDCSwitch;
const MDCChipSet = mdc.chips.MDCChipSet;
const MDCSliderFoundation = mdc.slider.MDCSliderFoundation;
const MDCSlider = mdc.slider.MDCSlider;
const MDCLinearProgressFoundation = mdc.linearProgress.MDCLinearProgressFoundation;
const MDCLinearProgress = mdc.linearProgress.MDCLinearProgress;
const colors = ['#00429d', '#4771b2', '#73a2c6', '#a5d5d8', '#ffffe0', '#ffbcaf', '#f4777f', '#cf3759', '#93003a'];

const datasetSelect = new MDCSelect(document.querySelector('#datasetSelect'));
const dialog = new MDCDialog(document.querySelector('#dialog'));
const snackbar = new MDCSnackbar(document.querySelector('#snackbar'));
var controlPanelSelects;
var dataTable;
var plot3DSwitch;
var dataLabelSelect;
var featuresChipSet;
var testingPercentSlider;
var trainingProgress;
var testingProgress;

let dataset = defaultDataset;

function pushNotification(notification, messageId, messageText){
    notification.close();
    $(messageId).html(messageText);
    notification.open();
}

function sortData(array, key, direction){
    let sortedArray = array
    sortedArray.sort(function(a, b){
        if (a[key] > b[key]){
            return 1;
        } else if (a[key] < b[key]){
            return -1;
        } else{
            return 0;
        }
    });
    if (direction == "descending"){
        sortedArray.reverse();
    }
    return sortedArray;
}

function genDataBrowserBody(data){
    let bodyHtml = "";
    data.forEach(function(row){
        bodyHtml += `<tr class="mdc-data-table__row">`;
        for (cell in row){
            if (isNaN(row[cell])){
                bodyHtml += `<td class="mdc-data-table__cell">${row[cell]}</td>`;
            } else{
                bodyHtml += `<td class="mdc-data-table__cell mdc-data-table__cell--numeric">${row[cell]}</td>`;
            }
        }
        bodyHtml += `</tr>`;
    });
    return bodyHtml;
}


function genDataBrowser(data){
    let headers = Object.keys(data[0]);
    let tableHtml = `<div class="mdc-data-table" id = "dataBrowserTable">
    <table class="mdc-data-table__table" aria-label="data browser">
      <thead>
        <tr class="mdc-data-table__header-row">`
    headers.forEach(function(header){
        tableHtml += `<th
            class="mdc-data-table__header-cell mdc-data-table__header-cell--with-sort"
            role="columnheader"
            scope="col"
            aria-sort="none"
            data-column-id="${header}"
          >
          <div class="mdc-data-table__header-cell-wrapper">
            <div class="mdc-data-table__header-cell-label">
              ${header}
            </div>
            <button class="mdc-icon-button material-icons mdc-data-table__sort-icon-button"
                    aria-label="Sort by dessert" aria-describedby="dessert-status-label">arrow_upward</button>
            <div class="mdc-data-table__sort-status-label" aria-hidden="true" id="dessert-status-label">
            </div>
          </div>
          </th>`;
    }); 
    tableHtml += `</tr> </thead> <tbody class="mdc-data-table__content" id = "dataBrowserBody">`;
    tableHtml += genDataBrowserBody(data);
    tableHtml += `</tbody></table> </div>`;
    $('#dataBrowser').html(tableHtml);
    dataTable = new MDCDataTable(document.querySelector("#dataBrowserTable"));
    dataTable.listen('MDCDataTable:sorted', (data) => {
        let key = data.detail.columnId;
        let direction = data.detail.sortValue;
        let sortedData = sortData(workingData, key, direction);
        $('#dataBrowserBody').html(genDataBrowserBody(sortedData));
    });
    return null;
}

function unpack(rows, key) {
	return rows.map(function(row)
    { return row[key]; });
}

function genPlot(target, data, groupBy, xAxis, yAxis, zAxis){
    let groupValues = unpack(data, groupBy);
    let uniqueValues = groupValues.filter(function(a,b){
        return(groupValues.indexOf(a) === b);
    });
    let groupStyles = [];
    let uniqueValueQuantity = uniqueValues.length;
    let colorStep = Math.floor((colors.length/uniqueValueQuantity));
    for(i = 0; i < uniqueValueQuantity; i++){
        groupStyles.push({target: uniqueValues[i], value: {marker: {color: colors[i*colorStep]}}});
    }
    let trace = {
        x:unpack(data, xAxis), y: unpack(data, yAxis), z:unpack(data, zAxis),
        mode: 'markers',
        marker:{
            opacity: 0.8
        },
        transforms: [{
            type: 'groupby',
            groups: groupValues,
            styles: groupStyles
          }],
        type: 'scatter3d'
    };
    let plotData = [trace];
    let layout = {margin: {
        l: 0,
        r: 0,
        b: 0,
        t: 0
      },
      scene: {
		xaxis:{title: xAxis},
		yaxis:{title: yAxis},
		zaxis:{title: zAxis},
		} 
    };
    let config = {responsive: true}
    Plotly.react(target, plotData, layout, config);
}

function genSelectHtml(id, values, label){
    let selectHtml = `<div class="mdc-select mdc-select--filled" id = "${id}">
                            <div class="mdc-select__anchor"
                                role="button"
                                aria-haspopup="listbox"
                                aria-expanded="false"
                                aria-labelledby="${id}-label ${id}-selected-text">
                            <span class="mdc-select__ripple"></span>
                            <span id="${id}-label" class="mdc-floating-label">${label} </span>
                            <span id="${id}-selected-text" class="mdc-select__selected-text"></span>
                            <span class="mdc-select__dropdown-icon">
                                <svg
                                    class="mdc-select__dropdown-icon-graphic"
                                    viewBox="7 10 10 5" focusable="false">
                                <polygon
                                    class="mdc-select__dropdown-icon-inactive"
                                    stroke="none"
                                    fill-rule="evenodd"
                                    points="7 10 12 15 17 10">
                                </polygon>
                                <polygon
                                    class="mdc-select__dropdown-icon-active"
                                    stroke="none"
                                    fill-rule="evenodd"
                                    points="7 15 12 10 17 15">
                                </polygon>
                                </svg>
                            </span>
                            <span class="mdc-line-ripple"></span>
                            </div>
                        
                            <div class="mdc-select__menu mdc-menu mdc-menu-surface mdc-menu-surface--fullwidth">
                            <ul class="mdc-list" role="listbox" aria-label="listbox">`;
        values.forEach(function(value){
            selectHtml += ` <li class="mdc-list-item" aria-selected="false" data-value="${value}" role="option">
                            <span class="mdc-list-item__ripple"></span>
                            <span class="mdc-list-item__text">
                                ${value}
                            </span>
                            </li>`;
        });
        selectHtml += `</ul></div></div>`;
        return selectHtml;
}

function genVizSuite(data){
    let headers = Object.keys(data[0]);
    let controlPanelHtml = "";
    // let controlPanelHtml = `<div class = "switchContainer"><div class = "mdc-switch" id = "plot3DSwitch">
    //                             <div class="mdc-switch__track"></div>
    //                             <div class="mdc-switch__thumb-underlay">
    //                                 <div class="mdc-switch__thumb"></div>
    //                                 <input type="checkbox" id="3dSwitch" class="mdc-switch__native-control" role="switch" aria-checked="false">
    //                             </div>
    //                         </div>
    //                         <label for="3dSwitch"><span class="material-icons">blur_circular</span> 3D Plot</label></div>`;
    let dropDownCount = 4;
    let selectLabel = ["x Axis", "y Axis", "z Axis", "Group by"];
    let selectID = ["xAxis", "yAxis", "zAxis", "groupBy"];
    for(i = 0; i < dropDownCount; i++){
        controlPanelHtml += genSelectHtml(selectID[i], headers, selectLabel[i]);
    }

    $('#dataVisualizer > .controlPanel').html(controlPanelHtml);
    controlPanelSelects = [].map.call(document.querySelectorAll("#dataVisualizer .mdc-select"),function(el){
        return new MDCSelect(el);
    });
    for(i=0; i < controlPanelSelects.length; i++){
        controlPanelSelects[i].value = headers[i+1];
        controlPanelSelects[i].listen('MDCSelect:change', () => {
            genPlot('visualizerPlot', data, controlPanelSelects[3].value, controlPanelSelects[0].value, controlPanelSelects[1].value, controlPanelSelects[2].value);
        });
    }
    genPlot('visualizerPlot', data, controlPanelSelects[3].value, controlPanelSelects[0].value, controlPanelSelects[1].value, controlPanelSelects[2].value);
    // plot3DSwitch = new MDCSwitch(document.querySelector("#plot3DSwitch"));

}

function genClassifierSuite(data){
    let classifierControlPanelHtml = "";
    let headers = Object.keys(data[0]);
    classifierControlPanelHtml += genSelectHtml('dataLabels', headers, 'Data Labels');
    classifierControlPanelHtml += `<p> Features to train on: </p><div class="mdc-chip-set mdc-chip-set--filter" id = "featuresChipSet" role="grid">`
    headers.forEach(function(header){
        classifierControlPanelHtml += `<div class="mdc-chip" role="row" id = ${header}>
                                        <div class="mdc-chip__ripple"></div>
                                        <span class="mdc-chip__checkmark" >
                                            <svg class="mdc-chip__checkmark-svg" viewBox="-2 -3 30 30">
                                            <path class="mdc-chip__checkmark-path" fill="none" stroke="black"
                                                    d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
                                            </svg>
                                        </span>
                                        <span role="gridcell">
                                            <span role="checkbox" tabindex="0" aria-checked="false" class="mdc-chip__primary-action">
                                            <span class="mdc-chip__text">${header}</span>
                                            </span>
                                        </span>
                                        </div>`
    })                       
    classifierControlPanelHtml += `</div>`;
    classifierControlPanelHtml += `<p>Percent testing data: <span id = "percentTestingLabel">20</span>%</p><div class="mdc-slider mdc-slider--discrete" id = "testingPercentSlider" tabindex="0" role="slider"
                                        aria-valuemin="5" aria-valuemax="95" aria-valuenow="20" data-step="5"
                                        aria-label="Select Value">
                                    <div class="mdc-slider__track-container">
                                    <div class="mdc-slider__track"></div>
                                    </div>
                                    <div class="mdc-slider__thumb-container">
                                    <div class="mdc-slider__pin">
                                        <span class="mdc-slider__pin-value-marker"></span>
                                    </div>
                                    <svg class="mdc-slider__thumb" width="21" height="21">
                                        <circle cx="10.5" cy="10.5" r="7.875"></circle>
                                    </svg>
                                    <div class="mdc-slider__focus-ring"></div>
                                    </div>
                                    </div>
                                   
                                    `;
    $('#classifierSuite > .controlPanel').html(classifierControlPanelHtml);
    dataLabelSelect = new MDCSelect(document.querySelector('#dataLabels'));
    featuresChipSet = new MDCChipSet(document.querySelector('#featuresChipSet'));
    testingPercentSlider = new MDCSlider(document.querySelector('#testingPercentSlider'));

    testingPercentSlider.listen('MDCSlider:change', () => {
        $('#percentTestingLabel').text(testingPercentSlider.value);
    });

    let progressHtml = `<p>Training status: <span id = "trainingStatus"> Not Started <span class="material-icons">layers_clear</span></span></p>
                        <div role="progressbar" class="mdc-linear-progress" id = "trainingProgress" aria-label="Example Progress Bar" aria-valuemin="0" aria-valuemax="1" aria-valuenow="0">
                            <div class="mdc-linear-progress__buffer">
                            <div class="mdc-linear-progress__buffer-bar"></div>
                            <div class="mdc-linear-progress__buffer-dots"></div>
                            </div>
                            <div class="mdc-linear-progress__bar mdc-linear-progress__primary-bar">
                            <span class="mdc-linear-progress__bar-inner"></span>
                            </div>
                            <div class="mdc-linear-progress__bar mdc-linear-progress__secondary-bar">
                            <span class="mdc-linear-progress__bar-inner"></span>
                            </div>
                        </div>
                        <p>Testing status: <span id = "testingStatus"> Not Started <span class="material-icons">layers_clear</span></span></p>
                        <div role="progressbar" class="mdc-linear-progress" id = "testingProgress" aria-label="Example Progress Bar" aria-valuemin="0" aria-valuemax="1" aria-valuenow="0">
                            <div class="mdc-linear-progress__buffer">
                            <div class="mdc-linear-progress__buffer-bar"></div>
                            <div class="mdc-linear-progress__buffer-dots"></div>
                            </div>
                            <div class="mdc-linear-progress__bar mdc-linear-progress__primary-bar">
                            <span class="mdc-linear-progress__bar-inner"></span>
                            </div>
                            <div class="mdc-linear-progress__bar mdc-linear-progress__secondary-bar">
                            <span class="mdc-linear-progress__bar-inner"></span>
                            </div>
                        </div>
                        <button class="mdc-button mdc-button--raised" id = "trainClassifier">
                        <div class="mdc-button__ripple" ></div>
                        <i class="material-icons mdc-button__icon" aria-hidden="true"
                            >model_training</i
                        >
                        <span class="mdc-button__label">Train Classifier</span>
                        </button>
                        <p id = "accuracyReport"> </p>
                      
    `;
    $('#classifierSuite > .progress').html(progressHtml);
    trainingProgress = new MDCLinearProgress(document.querySelector('#trainingProgress'));
    testingProgress = new MDCLinearProgress(document.querySelector('#testingProgress'));
    $('#trainClassifier').click(function(){
        initTraining(workingClassifier, workingData, testingPercentSlider.value);
    });
}


function configureWorkspace(data){
    pushNotification(snackbar, '#snackbarMessage', 'Configuring workspace...');
    genDataBrowser(data);
    genVizSuite(data);
    genClassifierSuite(data);
    pushNotification(snackbar, '#snackbarMessage', 'Workspace configured successfully.');

}

/**
 * [parseData parses CSV file and assigns the data to the workingData variable]
 * @param  {string} file String containing filepath to the csv data file or file object
 * @return {null}      Returns null 
 */
function parseData(file){
    Papa.parse(file, {
        header: true,
        error: function(error){
            let errorMessage = "An error was encountered loading your file. The error is as follows: " + error;
            pushNotification(dialog, '#dialogMessage', errorMessage);
        },
        complete: function(data){
            pushNotification(snackbar, '#snackbarMessage', 'Data loaded successfully');
            workingData = data['data'];
            workingData.pop();
            configureWorkspace(workingData);
           
        }
    });
    return null;
}

/**
 * [loadData detects the type of file passed and parses the data accordingly]
 * @param  {string} file String containing filepath to the csv data file or file object
 * @return {null}      Returns null 
 */
function loadData(file){
   
    if((typeof file) == "string"){
        $.get(file, function(text){
                    parseData(text);
                }).fail(function(e){
                    let errorMessage = "An error was encountered loading your file. The error is as follows: " + e['status'] + " " + e['statusText'];
                    pushNotification(dialog, '#dialogMessage', errorMessage);
                });
        } else{
            parseData(file);
        }
    return null;
}

function defaultDataLoad(dataset){
    loadData(dataset);
    $('#dataSource').text(dataset);
}

function retrieveLegend(){
    let legend = [];
    let currentLabel = dataLabelSelect.value;
    if (currentLabel == ""){
        pushNotification(dialog, '#dialogMessage', "Please select a label to classify on prior to training.");
        return null;
    } else{
        legend['label'] = currentLabel;
    }
    let currentFeatures = featuresChipSet.selectedChipIds;
    if(currentFeatures.length < 1){
        pushNotification(dialog, '#dialogMessage', "Please select features to train on.");
        return null;
    } else{
        legend['features'] = currentFeatures;
    }
    return legend;
}

function gui(){

    if(defaultDataset != ''){
        defaultDataLoad(defaultDataset);
    }

    datasetSelect.listen('MDCSelect:change', () => {
        dataset =  "assets/datasets/" + datasetSelect.value;
        $('#dataSource').text(datasetSelect.value);
    });
    
    $('#fileUploadInput').change(function(){
        dataset = document.querySelector('#fileUploadInput').files[0];
        $('#dataSource').text(document.querySelector('#fileUploadInput').value);
    });

    $('#loadData').click(function(){
        if (dataset == null | dataset == ""){
            pushNotification(dialog, "#dialogMessage", "Please select a dataset or upload one of your own prior to loading the data.");
        }else{
            $('#snackbarMessage').text("Loading data...");
            pushNotification(snackbar, "#snackbarMessage", "Loading data...");
            loadData(dataset);
        }
    });
    
}

$(document).ready(function(){
    gui();
});
