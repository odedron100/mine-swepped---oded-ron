'use strict'

var elapsedTime = 0;
var startTime;
var timerInterval;

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function findNeighborsCount(location) {
  var countOfMine = 0;
  for (var i = location.i - 1; i <= location.i + 1; i++) {
    if (i < 0 || i > gBoard.length - 1) continue;
    for (var j = location.j - 1; j <= location.j + 1; j++) {
      if (j < 0 || j > gBoard[0].length - 1) continue;
      if (i === location.i && j === location.j) continue;
      if (gBoard[i][j].isMine) {
        countOfMine++;
      }
    }
  }
  return countOfMine;
}

function findNeighbors(location) {
  var neighborsArray = [];
  for (var i = location.i - 1; i <= location.i + 1; i++) {
    if (i < 0 || i > gBoard.length - 1) continue;
    for (var j = location.j - 1; j <= location.j + 1; j++) {
      if (j < 0 || j > gBoard[0].length - 1) continue;
      if (i === location.i && j === location.j) continue;
      neighborsArray.push({ i: i, j: j });
    }
  }
  return neighborsArray;
}

function renderCell(location, value) {
  var elCell = document.querySelector(`#cell${location.i}-${location.j}`);
  elCell.innerHTML = value;
}

function getRandomLocationOfMines(size, numOfMines) {
  console.log('start');
  var minesLocations = [];
  for (var index = 0; index < numOfMines; index++) {
    var location = getLocation(size);
    var currCell = gBoard[location.i][location.j];
    if (index === 0 && !currCell.isShown) {
      minesLocations.push(location);
      currCell.isMine = true;
    }
    else {
      var isEmptyPlace = checkIfTwoMinesInSamePlace(location, minesLocations);
      console.log('isEmptyPlace', isEmptyPlace);
      if (isEmptyPlace && !currCell.isShown) {
        currCell.isMine = true;
        minesLocations.push(location);
      } else {
        console.log('break');
        cleanMinesInBoard(minesLocations)
        getRandomLocationOfMines(gLevel.SIZE, gLevel.MINES);
        return;
      }
    }
  }
  return minesLocations;
}

function checkIfTwoMinesInSamePlace(location, minesArray) {
  for (var index = 0; index < minesArray.length; index++) {
    if ((minesArray[index].i) === location.i && (minesArray[index].j) === location.j) return false
    return true;
  }
}

function cleanMinesInBoard(minesLocations) {
  for (var index = 0; index < minesLocations.length; index++) {
    var currCell = gBoard[minesLocations[index].i][minesLocations[index].j];
    currCell.isMine = false;
    renderCell({ i: minesLocations[index].i, j: minesLocations[index].j }, '')
  }
}


function getLocation(size) {
  var randomI = getRandomInt(0, size - 1)
  var randomj = getRandomInt(0, size - 1)
  var location = { i: randomI, j: randomj };
  return location;
}

function renderMineCell(minesArray, value) {
  for (var i = 0; i < minesArray.length; i++) {
    var elCell = document.querySelector(`#cell${minesArray[i].i}-${minesArray[i].j}`);
    elCell.innerHTML = value;
  }
}

function levelClicked(size, mines) {
  gLevel.SIZE = size;
  gLevel.MINES = mines;

  restart();
}

function start() {
  startTime = Date.now() - elapsedTime;
  timerInterval = setInterval(function printTime() {
    elapsedTime = Date.now() - startTime;
    displayTimer(timeToString(elapsedTime));
  }, 10);
}

function pause() {
  clearInterval(timerInterval);
}

function resetTimer() {
  clearInterval(timerInterval);
  displayTimer("00:00:00");
  elapsedTime = 0;
}



function timeToString(time) {
  let diffInHrs = time / 3600000;
  let hh = Math.floor(diffInHrs);

  let diffInMin = (diffInHrs - hh) * 60;
  let mm = Math.floor(diffInMin);

  let diffInSec = (diffInMin - mm) * 60;
  let ss = Math.floor(diffInSec);

  let diffInMs = (diffInSec - ss) * 100;
  let ms = Math.floor(diffInMs);

  let formattedMM = mm.toString().padStart(2, "0");
  let formattedSS = ss.toString().padStart(2, "0");
  let formattedMS = ms.toString().padStart(2, "0");

  return `${formattedMM}:${formattedSS}:${formattedMS}`;
}


function displayTimer(txt) {
  document.querySelector(".timer").innerHTML = txt;
}

function getCellById(id) {
  var getCellId = id.split('cell')[1];
  var locationI = +getCellId.split('-')[0];
  var locationj = +getCellId.split('-')[1];
  var cellLocation = { i: locationI, j: locationj };
  return cellLocation;
}
