function testClassifier(classifier, data, legend){

    return new Promise(function(resolve, reject){
        $('#testingStatus').html(`Testing...<span class="material-icons">flaky</span>`);
        testingProgress.determinate = false;
        testingProgress.progress = 1;
        let total = 0;
        let correct = 0;
        for (i = 0; i < data.length; i++){
            let row = data[i];
            label = row[legend['label']];
            let features = [];
            legend['features'].forEach(function(feature){
                features.push(parseFloat(row[feature]));
            });
            classifier.classify(features).then(function(guess){
                total++;
                if(guess['label'] == label){
                    correct++;
                }
                if(total == data.length){
                    resolve(correct/total);
                }
            });
        }     
        $('#testingStatus').html(`Completed <span class="material-icons">done</span>`);
        testingProgress.determinate = true;
    });
        

    
}

/**
 * [trainClassifier iterates through features and labels of a dataset to train a classifier]
 * @param  {object} classifier Name of the knn classifier constant to be trained
 * @param  {object[]} data Array of data containing both the set's features and labels
 * @param  {object[]} legend Array containing column names to differentiate between labels and features
 * @param  {string} legend[].labels A string denoting which column of data contains the labels of the dataset
 * @param  {object[]} legend[].features A list of strings that denote which columns contain features to train the classifier on
 * @return {null}      Returns null as it adds examples to the classifier object
 */

function trainClassifier(classifier, trainingData, testingData, legend){
    
    return new Promise(function(resolve, reject){
        trainingData.forEach(function(row){
            label = row[legend['label']];
            let features = [];
            legend['features'].forEach(function(feature){
                features.push(parseFloat(row[feature]));
            });
            classifier.addExample(features, label);
        });
        resolve({classifier, testingData, legend});

    });
    
    
}

function initTraining(classifier, data, testingPercent){
    let legend = retrieveLegend();
    if(legend != null){
        if (testingPercent >= 100 | testingPercent <= 0){
            throw "Testing percent must be > 0 and < 100.";
        } else{
            let testingPercentVal = testingPercent / 100;
            let testingPortion = Math.floor(data.length * testingPercentVal);
            data.sort(() => {Math.random() - 0.5});
            testingData = data.slice(0,testingPortion);
            trainingData = data.slice(testingPortion, data.length)
            $('#trainingStatus').html(`Training... <span class="material-icons">model_training</span>`);
            trainingProgress.determinate = false;
            trainClassifier(classifier, trainingData, testingData, legend).then(function(response){
                $('#trainingStatus').html(`Completed <span class="material-icons">done</span>`);
                trainingProgress.determinate = true;
                trainingProgress.progress = 1;
                testClassifier(classifier, testingData, legend).then(function(response){
                    $('#accuracyReport').html(`Accuracy: ${response * 100} %`);
                });
            });
        }
    }
    
}

