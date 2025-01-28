let updateFareHist; //This will be a function
let updateSurvivorPie;

//document.addEventListener("DOMContentLoaded", initFare);
//The function gets called in Line 139, after parsing the g_state.data
function initFare() {
    console.log("--------------------  initFare()  --------------------");
    //console.log(g_state.data);
    updateFareHist = createHistogram("#fare"); //Saving the update-Function here
    updateSurvivorPie = createPieChart('#survivor', true);
    processFareSurvivor();
}

function processFareSurvivor() {
    if(typeof updateFareHist !== 'function' || typeof updateSurvivorPie !== 'function') {
        console.warn("processFareHist called premature");
        return;
    }
    const filtered = filterData(); //Filter by Gender and Class
    let grouped = groupFareData(filtered);
    console.log(grouped);
    updateFareHist(grouped);

    //After this point: SurvivorPie
    console.log("--->", updateSurvivorPie);
    //const survivorData = groupBySurvival(filtered);
    const survivorData = [0, 1].map((key) => ({
            key,
            values: filtered.filter((d) => d.survived === key),
       }));
    console.log(survivorData);
    updateSurvivorPie(survivorData);
}

function groupFareData(filtered) {
    //This creates a function that does the grouping in 10 groups
    const fareHistogram = d3.bin().domain([0, 100]).thresholds(10).value((d) => d.fare);
    return fareHistogramData = fareHistogram(filtered);
}

function groupBySurvival(filtered) {
    let output = [
        {
            key: 1,
            values: []
        },
        {
            key: 0,
            values: []
        }
    ];
    for(let i = 0; i<filtered.length; i++) {}
    return output;
}