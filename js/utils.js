'use strict'
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function findNeighbors(location) {
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

function renderCell(location, value) {
  var elCell = document.querySelector(`#cell${location.i}-${location.j}`);
  elCell.innerHTML = value;
}

function getRandomLocationOfMines(size, numOfMines) {
  var minesLocations = [];
  for (var i = 0; i < numOfMines; i++) {
    var randomI = getRandomInt(0, size - 1)
    var randomj = getRandomInt(0, size - 1)
    var location = { i: randomI, j: randomj };
    minesLocations.push(location);
  }
  return minesLocations;
}

function renderMineCell(minesArray, value) {
  for (var i = 0; i < minesArray.length; i++) {
    var elCell = document.querySelector(`#cell${minesArray[i].i}-${minesArray[i].j}`);
    elCell.innerHTML = value;
  }
}

function levelClicked(elLevel) {
  console.log('elLevel', elLevel);
  if (elLevel.innerText === 'BEGINNER 👶') {
    gCurrLevel = EXPERT;
  }
  else if (elLevel.innerText === 'MEDIUM 👦') {
    gCurrLevel = MEDIUM;
  }
  else if (elLevel.innerText === 'BEGINNER 👶') {
    gCurrLevel = BEGINNER;
  }
  restart();
}
