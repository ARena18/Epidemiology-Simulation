//Epidemiology Simulation Project: Rena Ahn and Anna Muller
//Merged with Epidemiology.js [last update: 11/27/2023]
//   Improvement Goals...
//   (1) Proceeding through the simulation automatically or being able to look at desired (UI) days
//   (2) Implement a commenting style

//Person class
class Person {
  constructor(num) {
    this.num = num;
    this.transmission = 50;
    this.protection = 50;
    this.mask = false;
    this.vaccine = false;
    this.infectStatus = false;
    this.timeInfect = 0;
    this.immuneStatus = false;
    this.xCoordinate = 0;
    this.yCoordinate = 0;
  }

  // Setter method
  setGridPosition(xCoordinate, yCoordinate) {
    this.xCoordinate = xCoordinate;
    this.yCoordinate = yCoordinate;
  }

  // updates stats that have to do with being infected
  infectPerson() {
    this.infectStatus = true;
    this.transmission += simulation.disease.transmissionFactor;
  }

  // Desc : increments how long the person has been infected
  sickDay() {
    this.timeInfect++;
  }

  // Desc : updates stats to show immunity
  immune() {
    this.immuneStatus = true;
    this.infectStatus = false;
  }
}

//Disease class
class Disease {
  constructor(transmissionFactor, vaccineEfficacy, daysToSymptoms, daysToImmune) {
    this.transmissionFactor = transmissionFactor;
    this.vaccineEfficacy = vaccineEfficacy;
    this.daysToSymptoms = daysToSymptoms;
    this.daysToImmune = daysToImmune;
  }
}
const diseaseDictionary = {
  "leastInfectious": new Disease(20, 40, 2, 12), // covid inspired
  "mediumInfectious": new Disease(30, 30, 7, 14), // rubella inspired
  "mostInfectious": new Disease(40, 35, 4, 8) // measles inspired    
}

// Desc : Depending on the setting, number of people who wear masks
const maskDictionary = {
  "noMask": 0,
  "lowMask": 25,
  "mediumMask": 50,
  "highMask": 75,
  "extremeMask": 90
};

// Desc : Depending on setting, number of people who got the vaccine
const vaccineDictionary = {
  "noVacc": 0,
  "lowVacc": 25,
  "mediumVacc": 50,
  "highVacc": 75,
  "extremeVacc": 90
};

class Grid {
  constructor(gridHeight, gridWidth) {
    this.grid = [];
    this.gridHeight = gridHeight;
    this.gridWidth = gridWidth;
  }

  // Desc : builds the 2D grid based on its given height and width from Simulation
  build() {
    for (var i = 0; i < this.gridHeight; i++) {
      this.grid[i] = [];
      for (var j = 0; j < this.gridWidth; j++) {
        this.grid[i][j] = 0;
      }
    }

    var container = document.getElementById("grid");
    //refer to index.html, div element with id="grid"
    container.style.height = (this.gridHeight * 32) + 'px';
    container.style.width = (this.gridWidth * 32) + 'px';

    for (var x = 0; x < this.gridHeight; x++) for (var y = 0; y < this.gridWidth; y++) {
      var div = document.createElement("canvas");
      //creates a canvas element which represents a cell of the grid
      var tempStr = `${x} + ${y}`;
      //creates the id for the canvas element
      div.id = tempStr;
      div.height = 30;
      div.width = 30;
      container.appendChild(div);
      //the canvas element (div) is added to the grid (container)
    }
  }

  // Desc : hardcodes Patient Zero and its surrouding 8 contacts according to the given patient zero position in Simulation
  setPatientZero(totalPopulation, disease) {
    var patientZero = totalPopulation[0];
    patientZero.setGridPosition(simulation.patientZeroPosition[0], simulation.patientZeroPosition[1]);
    patientZero.infectPerson(disease);
    this.grid[patientZero.xCoordinate][patientZero.yCoordinate] = patientZero;

    var adjPerson1 = totalPopulation[1];
    adjPerson1.setGridPosition(simulation.patientZeroPosition[0] - 1, simulation.patientZeroPosition[1] - 1);
    this.grid[adjPerson1.xCoordinate][adjPerson1.yCoordinate] = adjPerson1;

    var adjPerson2 = totalPopulation[2];
    adjPerson2.setGridPosition(simulation.patientZeroPosition[0] - 1, simulation.patientZeroPosition[1]);
    this.grid[adjPerson2.xCoordinate][adjPerson2.yCoordinate] = adjPerson2;

    var adjPerson3 = totalPopulation[3];
    adjPerson3.setGridPosition(simulation.patientZeroPosition[0] - 1, simulation.patientZeroPosition[1] + 1);
    this.grid[adjPerson3.xCoordinate][adjPerson3.yCoordinate] = adjPerson3;

    var adjPerson4 = totalPopulation[4];
    adjPerson4.setGridPosition(simulation.patientZeroPosition[0], simulation.patientZeroPosition[1] - 1);
    this.grid[adjPerson4.xCoordinate][adjPerson4.yCoordinate] = adjPerson4;

    var adjPerson5 = totalPopulation[5];
    adjPerson5.setGridPosition(simulation.patientZeroPosition[0], simulation.patientZeroPosition[1] + 1);
    this.grid[adjPerson5.xCoordinate][adjPerson5.yCoordinate] = adjPerson5;

    var adjPerson6 = totalPopulation[6];
    adjPerson6.setGridPosition(simulation.patientZeroPosition[0] + 1, simulation.patientZeroPosition[1] - 1);
    this.grid[adjPerson6.xCoordinate][adjPerson6.yCoordinate] = adjPerson6;

    var adjPerson7 = totalPopulation[7];
    adjPerson7.setGridPosition(simulation.patientZeroPosition[0] + 1, simulation.patientZeroPosition[1]);
    this.grid[adjPerson7.xCoordinate][adjPerson7.yCoordinate] = adjPerson7;

    var adjPerson8 = totalPopulation[8];
    adjPerson8.setGridPosition(simulation.patientZeroPosition[0] + 1, simulation.patientZeroPosition[1] + 1);
    this.grid[adjPerson8.xCoordinate][adjPerson8.yCoordinate] = adjPerson8;
  }

  // Desc : sets the position of the rest of the population
  setPopulation(totalPopulation) {
    var i = 9;
    while (i < totalPopulation.length) {
      var randomX = getRNG(this.gridHeight);
      var randomY = getRNG(this.gridWidth);
      if (this.grid[randomX][randomY] == 0) {
        totalPopulation[i].setGridPosition(randomX, randomY);
        this.grid[randomX][randomY] = totalPopulation[i];
        i++;
      }
    }
  }

  //Desc : clears the board and updates gridHeight and gridWidth
  reset(height, width) {
    this.grid = [];
    this.gridHeight = height;
    this.gridWidth = width;
  }
}

const simulation = {
  "days": [],
  "simulationLength": 31,
  "gridHeight": 15,
  "gridWidth": 15,
  "seed": "15x15",
  "patientZeroPosition": [7, 5],
  "populationSize": 100,
  "disease": diseaseDictionary.leastInfectious,
  "maskLevel": maskDictionary.mediumMask,
  "maskProtection": 20,
  "vaccLevel": vaccineDictionary.mediumVacc
}

// Desc : This implements the seeded random value
const rng = new Math.seedrandom("15x15");
function getRNG(range) {
    return Math.floor(rng() * range);
}

// Desc : returns a list of randomly chosen people
function getRandomList(totalPopulation, length) {
  const listPeople = [];
  var i = 0;
  while (i < length) {
    const person = totalPopulation[getRNG(totalPopulation.length)];
    if (!listPeople.includes(person)) {
      listPeople.push(person);
      i++;
    }
  }
  return listPeople;
}

// Desc : changes stats of the given list and gives them a mask
function assignMasks(maskedPeople) {
  for (var i = 0; i < maskedPeople.length; i++) {
    maskedPeople[i].mask = true;
    maskedPeople[i].protection += simulation.maskProtection;
    maskedPeople[i].transmission -= simulation.maskProtection;
  }
}

// Desc : changes stats of the given list and gives them vaccines
function assignVacc(vaccPeople) {
  for (var i = 0; i < vaccPeople.length; i++) {
    vaccPeople[i].vaccine = true;
    vaccPeople[i].protection += simulation.disease.vaccineEfficacy;
    vaccPeople[i].transmission -= simulation.disease.vaccineEfficacy;
  }
}

// Desc : makes two lists and gives them either masks or vaccines (or both)
function setPopulationStats() {
  const maskedPeople = getRandomList(totalPopulation, simulation.maskLevel);
  assignMasks(maskedPeople);
  const vaccPeople = getRandomList(totalPopulation, simulation.vaccLevel);
  assignVacc(vaccPeople);
}

// Desc : finds everyone who is currently infected, updates their sick/immune state, returns a list of everyone still currently infected
function updateInfected(totalPopulation) {
  const attackerList = [];
  for (var i = 0; i < totalPopulation.length; i++) {
    if (totalPopulation[i].infectStatus) {
      if (totalPopulation[i].timeInfect >= simulation.disease.daysToImmune) {
        totalPopulation[i].immune();
      } else {
        attackerList.push(totalPopulation[i]);
        totalPopulation[i].sickDay();
      }
    }
  }
  return attackerList;
}

// Desc : for everyone in the attacker list, it checks every surrounding contact and tries to infect them
function transmitDisease(attackerList, grid) {
  for (var i = 0; i < attackerList.length; i++) {
      var attackerX = attackerList[i].xCoordinate;
      var attackerY = attackerList[i].yCoordinate;
  
      if (checkDefender(attackerX - 1, attackerY - 1)) {
          infect(attackerList[i], grid[attackerX - 1][attackerY - 1]);
      }
      if (checkDefender(attackerX - 1, attackerY)) {
          infect(attackerList[i], grid[attackerX - 1][attackerY]);
      }
      if (checkDefender(attackerX - 1, attackerY + 1)) {
          infect(attackerList[i], grid[attackerX - 1][attackerY + 1]);
      }
      if (checkDefender(attackerX, attackerY - 1)) {
          infect(attackerList[i], grid[attackerX][attackerY + 1]);
      }
      if (checkDefender(attackerX, attackerY + 1)) {
          infect(attackerList[i], grid[attackerX][attackerY + 1]);
      }
      if (checkDefender(attackerX + 1, attackerY - 1)) {
          infect(attackerList[i], grid[attackerX + 1][attackerY - 1]);
      }
      if (checkDefender(attackerX + 1, attackerY)) {
          infect(attackerList[i], grid[attackerX + 1][attackerY]);
      }
      if (checkDefender(attackerX + 1, attackerY + 1)) {
          infect(attackerList[i], grid[attackerX + 1][attackerY + 1]);
      }
  }    
}

// Desc : Checks to see if the given defender is in the bounds of the 2D array and if they fit the criteria of a defender
function checkDefender(x, y) {
  if ((x >= 0 && x < simulation.gridHeight) && (y >= 0 && y < simulation.gridWidth)) {
      if (town.grid[x][y] != 0 && town.grid[x][y].infectStatus == false  && town.grid[x][y].immuneStatus == false) {
          return true;
      }
  } else {
      return false;
  }
}

// Desc : uses a random number to see if the given attacker infects the given defender
function infect(attacker, defender) {
  var infect = getRNG(attacker.transmission + defender.protection);
  if (infect <= attacker.transmission) {
      defender.infectPerson();
  }
}

//declaring and initializing user input variables
var diseaseInput = document.getElementById("diseaseText");
var maskInput = document.getElementById("maskText");
var vaccInput = document.getElementById("vaccText");
var gridInput = document.getElementById("gridSlider");
var dayDisplay = document.getElementById("dayInfo");
var infectedDisplay = document.getElementById("infectedInfo");
var immuneDisplay = document.getElementById("immuneInfo");
var maxDayDisplay = document.getElementById("maxDayInfo");
var jsonInput = document.getElementById("jsonText");
jsonInput.value = JSON.stringify(simulation, null, " ");

//Returns the mask level (refer to maskDictionary) according to maskRate
//Pre-condition: maskRate is the number inputed by the user
function getMaskLevel(maskRate) {
  if(maskRate == 0) {
    return maskDictionary.noMask;
  } else if(maskRate <= 25) {
    return maskDictionary.lowMask;
  } else if(maskRate <= 50) {
    return maskDictionary.mediumMask;
  } else if(maskRate <= 75) {
    return maskDictionary.highMask;
  } else {
    return maskDictionary.extremeMask;
  }
}

//Returns the mask level (refer to vaccineDictionary) according to maskRate
//Pre-condition: maskRate is the number inputed by the user
function getVaccLevel(vaccRate) {
  if(vaccRate == 0) {
    return vaccineDictionary.noMask;
  } else if(vaccRate <= 25) {
    return vaccineDictionary.lowMask;
  } else if(vaccRate <= 50) {
    return vaccineDictionary.mediumMask;
  } else if(vaccRate <= 75) {
    return vaccineDictionary.highMask;
  } else {
    return vaccineDictionary.extremeMask;
  }
}

//Returns the infectiousness of the disease (refer to diseaseDictionary) according to disease
//Pre-condition: disease is the name of a disease inputed by the user
function getDiseaseLevel(disease) {
  if(disease == "Covid") {
    return diseaseDictionary.leastInfectious;
  } else if(disease == "Rubella") {
    return diseaseDictionary.mediumInfectious;
  } else if(disease == "Measles") {
    return diseaseDictionary.mostInfectious;
  }
}

//Draws the grid according to dayGrid
//Pre-condition: dayInfo is the information of the simulation for a certain day
function display(dayInfo) {
  var dayGrid = dayInfo.grid;
  for (var i = 0; i < dayGrid.length; i++) {
    for (var j = 0; j < dayGrid[i].length; j++) {
      var tempStr = `${i} + ${j}`;
      var canvas = document.getElementById(tempStr);
      var context = canvas.getContext("2d");
      if (dayGrid[i][j] === 0) {
        context.clearRect(0, 0, context.height, context.width)
        continue;
      }

      if (dayGrid[i][j].immuneStatus) {
        context.fillStyle = "green";
      } else if (dayGrid[i][j].infectStatus && dayGrid[i][j].timeInfect >= simulation.disease.daysToSymptoms) {
        context.fillStyle = "red";
      } else if (dayGrid[i][j].infectStatus) {
        context.fillStyle = "orange"; 
      } else {
        context.fillStyle = "blue";
      }
      context.beginPath();
      context.arc(15, 15, 12, 0, 2 * Math.PI);
      context.fill();
    }
  }

  dayDisplay.innerHTML = `Day ${day}`;
  infectedDisplay.innerHTML = `Infected: ${dayInfo.prevalence}`;
  immuneDisplay.innerHTML = `Immune: ${dayInfo.resistant}`;
}

//Deletes the current cavas elements in the grid
function emptyGrid() {
  var container = document.getElementById("grid");
    //refer to index.html, div element with id="grid"
  //empties out the grid of canvas element cells
  while (container.hasChildNodes()) {
    container.removeChild(container.firstChild);
  }
}

//Runs the simulation
function simulate() {
  town.reset(simulation.gridHeight, simulation.gridWidth);
  town.build();
  town.setPatientZero(totalPopulation, simulation.disease);
  town.setPopulation(totalPopulation);
  setPopulationStats();
  day = 1;
  day1Data.grid = JSON.parse(JSON.stringify(town.grid));
  display(day1Data);
  simulation.days[0] = day1Data;

  while (day < simulation.simulationLength) {
    const attackerList = updateInfected(totalPopulation);
    transmitDisease(attackerList, town.grid);
    
    // calculates the total infected and total immune people, checks to see if the disease can move anywhere the next day
    var totalInfected = 0;
    var totalImmune = 0;
    for (var i = 0; i < totalPopulation.length; i++) {
        if (totalPopulation[i].infectStatus) {
            totalInfected++;
        } else if (totalPopulation[i].immuneStatus) {
            totalImmune++;
        }
    }
  
    simulation.days[day] = {
      day: day+1,
      grid: JSON.parse(JSON.stringify(town.grid)),
      prevalence: totalInfected,
      incidence: totalInfected - simulation.days[day-1].prevalence,
      resistant: totalImmune,
      r: 0
    };
  
    day++;
    if (totalInfected == 0) {
      break;
    } else if ((totalInfected + totalImmune) == totalPopulation.length) {
      break;
    }
  }
  day = 1;
  maxDay = simulation.days.length;
  maxDayDisplay.innerHTML = `The simulation continues until Day ${maxDay}.`;
}

//Desc : creates a line graph according to data
//Pre  : data is an array of objects
function graph(data) {
  data.forEach(function (d) {
    d.infected = d.prevalence;
    d.date = d.day;
  })
  // append the svg object to the body of the page
  var svg = d3.select("#graph")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  // Add X axis
  var x = d3.scaleLinear()
    .domain([ 0, maxDay ])
    .range([ 0, width ]);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));
  // Add Y axis
  var y = d3.scaleLinear()
    .domain( [ 0, 100 ])
    .range([ height, 0 ]);
  svg.append("g")
    .call(d3.axisLeft(y));

  // Add the line
  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#69b3a2")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
      .curve(d3.curveBasis)
      .x(function (d) {
        return x(d.date);
      })
      .y(function (d) {
        return y(d.infected);
      })
  )

  // create a tooltip
  var Tooltip = d3.select("#my_dataviz")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px");

  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function(d) {
    Tooltip
      .style("opacity", 1);
  }
  var mousemove = function(d) {
    Tooltip
      .html("Exact value: " + d.infected)
      .style("left", (d3.mouse(this)[0]+70) + "px")
      .style("top", (d3.mouse(this)[1]) + "px");
  }
  var mouseleave = function(d) {
    Tooltip
      .style("opacity", 0);
  }

  // Add the points
  svg
    .append("g")
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function(d) { return x(d.date) } )
    .attr("cy", function(d) { return y(d.infected) } )
    .attr("r", 5)
    .attr("fill", "#69b3a2")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);
}

//Deletes the current canvas elements in the grid, updates json (simulation) variables according to user input,
//resets attributes of the people in totalPopulation, and rebuilds a grid according to the new values
function runUserSim() {
  emptyGrid();

  simulation.days = [];
  simulation.simulationLength = 31;
  simulation.gridHeight = gridInput.value;
  simulation.gridWidth = gridInput.value;
  simulation.seed = "15x15";
  simulation.patientZeroPosition = [7, 5];
  simulation.disease = getDiseaseLevel(diseaseInput.value);
  simulation.maskLevel = getMaskLevel(maskInput.value);
  simulation.maskProtection = 20;
  simulation.vaccLevel = getVaccLevel(vaccInput.value);
  jsonInput.value = JSON.stringify(simulation, null, " ");

  for (var i = 0; i < simulation.populationSize; i++) {
    totalPopulation[i].transmission = 50;
    totalPopulation[i].protection = 50;
    totalPopulation[i].mask = false;
    totalPopulation[i].vaccine = false;
    totalPopulation[i].infectStatus = false;
    totalPopulation[i].timeInfect = 0;
    totalPopulation[i].immuneStatus = false;
  }
  simulate();

  d3.select("svg").remove(); //clearing previous graph
  graph(simulation.days.slice(0, day));
}

//Deletes the current canvas elements in the grid, updates json (simulation) variables according to the json
//configuration, resets attributes of the people in totalPopulation, and rebuilds a grid according to the new values
function runConfigSim() {
  emptyGrid();

  simulation.days = [];
  var tempSim = JSON.parse(jsonInput.value);
  simulation.simulationLength = tempSim.simulationLength;
  simulation.gridHeight = tempSim.gridHeight;
  simulation.gridWidth = tempSim.gridWidth;
  simulation.seed = tempSim.seed;
  simulation.patientZeroPosition = tempSim.patientZeroPosition;
  simulation.disease = tempSim.disease;
  simulation.maskLevel = tempSim.maskLevel;
  simulation.maskProtection = tempSim.maskProtection;
  simulation.vaccLevel = tempSim.vaccLevel;
  jsonInput.value = JSON.stringify(simulation, null, " ");

  for (var i = 0; i < simulation.populationSize; i++) {
    totalPopulation[i].transmission = 50;
    totalPopulation[i].protection = 50;
    totalPopulation[i].mask = false;
    totalPopulation[i].vaccine = false;
    totalPopulation[i].infectStatus = false;
    totalPopulation[i].timeInfect = 0;
    totalPopulation[i].immuneStatus = false;
  }
  simulate();

  d3.select("svg").remove(); //clearing previous graph
  graph(simulation.days.slice(0, day));
}

//Decrements day and draws the grid of the corresponding day
function subtractDay() {
  if(day <= 1) {
    return;
  }
  day--;
  display(simulation.days[day-1]);
}

//Increments day and draws the grid of the corresponding day
function addDay() {
  if(day >= maxDay) {
    return;
  }
  day++;
  display(simulation.days[day-1]);

  d3.select("svg").remove(); //clearing previous graph
  if(dayReached < day) {
    dayReached = day;
  }
  graph(simulation.days.slice(0, dayReached));
}

// Desc : makes the list of people 
var totalPopulation = [];
for (var i = 0; i < simulation.populationSize; i++) {
  totalPopulation.push(new Person(i));
}

// Desc : declaring variables needed for the simulation
const town = new Grid(simulation.gridHeight, simulation.gridWidth);
var day = 1;
var dayReached = day;
var day1Data = {
  day: 1,
  grid: JSON.parse(JSON.stringify(town.grid)),
  prevalence: 1,
  incidence: 0, 
  resistant: 0,
  r: 0
};

// set the dimensions and margins of the graph
var margin = {top: 60, right: 90, bottom: 30, left: 30},
width = 560 - margin.left - margin.right,
height = 400 - margin.top - margin.bottom;
