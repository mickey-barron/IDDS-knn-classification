const defaultDataset = "assets/datasets/school_acceptance_records.csv"; //set this to your working dataset to override the dropdown menu
const knnClassifier = ml5.KNNClassifier(); //declares the classifier constant

var workingData = new Object; //declare a container for the working data
var workingClassifier = knnClassifier; //define which classifier is to be used



