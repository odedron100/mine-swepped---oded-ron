'use strict'
const MINE = '💣';
const FLAG = '🚩';
const WIN_EMOJI = '😎';
const LOSE_EMOJI = '😭';
const LOSE_life_EMOJI = '😞';
const REGULAR_EMOJI = '😊';


var isHint = false;
var gSafeRemaining = 3;
var gCurrMine = null;
var gNumberOfLife = 3;
var gCurrentEmoji;
var isWin;
var gMinesLocations;
var gBoard;
var gLevel = {
  SIZE: 4,
  MINES: 2
};
var gGame = {
  isOn: false,
  shownCount: 0, markedCount: 0, secsPassed: 0
}

function init() {
  updateRecord();
  gBoard = buildBoard(gLevel.SIZE);
  renderBoard(gBoard);
}

function buildBoard(level) {
  gGame.isOn = true;
  var board = [];
  for (var i = 0; i < level; i++) {
    board[i] = [];
    for (var j = 0; j < level; j++) {
      board[i][j] = { minesAroundCount: null, isShown: false, isMine: false, isMarked: false }
    }
  }
  return board;
}

function renderBoard(board) {
  var strHTML = '';
  for (var i = 0; i < board.length; i++) {
    strHTML += ` <tr>`
    for (var j = 0; j < board.length; j++) {
      strHTML += `<td class="cell" id="cell${i}-${j}" onClick="onCellClicked(this)" oncontextmenu="cellMarked(this)"></td>`
    }
  }
  strHTML += `</tr>`
  var elBoard = document.querySelector('.game-board')
  elBoard.innerHTML = strHTML;
}

function onCellClicked(elCell) {
  if (gGame.shownCount === 0) start();

  var id = elCell.getAttribute('id')
  var cellLocation = getCellById(id);
  var currCell = gBoard[cellLocation.i][cellLocation.j];
  if (gGame.isOn === false || currCell.isShown) return;
  if (isHint === true) {
    setMinesNegsCount(cellLocation);
    isHint = false;
    return;
  }

  if (!currCell.isShown && !currCell.isMine) {
    setMinesNegsCount(cellLocation)
    currCell.isShown = true;
    gGame.shownCount++;
    checkWin();
  } else if (!currCell.isShown && currCell.isMine) {
    gGame.isOn = false
    renderCell(cellLocation, MINE);
    gCurrMine = cellLocation;
    isWin = false;
    gameOver();
  }
  if (gGame.shownCount === 1) {
    gMinesLocations = getRandomLocationOfMines(gLevel.SIZE, gLevel.MINES);
    setMinesNegsCount(cellLocation);
  }
}

function cellMarked(elCell) {
  event.preventDefault();
  var id = elCell.getAttribute('id')
  var cellLocation = getCellById(id);
  var currCell = gBoard[cellLocation.i][cellLocation.j];
  if (gGame.isOn === false || currCell.isShown) return;
  currCell.isMarked = !currCell.isMarked;
  if (currCell.isMarked) {
    renderCell(cellLocation, FLAG);
    gGame.shownCount++;
    gGame.markedCount++;
  } else {
    renderCell(cellLocation, '');
    gGame.shownCount--;
    gGame.markedCount--;
  }
  checkWin();
}

function setMinesNegsCount(location) {
  var neighborsCount = findNeighborsCount({ i: location.i, j: location.j });
  if (!isHint) {
    renderCell({ i: location.i, j: location.j }, neighborsCount);
    gBoard[location.i][location.j].minesAroundCount = neighborsCount;
  }
  else if (isHint && gBoard[location.i][location.j] === false) {
    renderCell({ i: location.i, j: location.j }, neighborsCount);
    setTimeout(() => renderCell({ i: location.i, j: location.j }, ''), 1000)
  }
  if (neighborsCount === 0 && gGame.shownCount > 0 || isHint) {
    openNeighbors(location);
  }
}

function hintsNeighbors(location) {
  var currCell = gBoard[location.i][location.j];
  var neighborsCount = findNeighborsCount({ i: location.i, j: location.j });
  if (currCell.isShown === false && !isHint) {
    renderCell({ i: location.i, j: location.j }, neighborsCount);
    currCell.minesAroundCount = neighborsCount;
    currCell.isShown = true;
    gGame.shownCount++;
  }
  else if (isHint) {
    var elNeighbor = document.querySelector(`#cell${location.i}-${location.j}`);
    if (currCell.isShown === true) return;
    var value;
    if (currCell.isMine === true) {
      value = MINE;
    } else if (currCell.isShown === false) {
      value = neighborsCount;
    }
    elNeighbor.classList.add('hints-negs');
    setTimeout(() => elNeighbor.classList.remove('hints-negs'), 1500)
    renderCell({ i: location.i, j: location.j }, value);
    setTimeout(() => renderCell({ i: location.i, j: location.j }, ''), 1000)
  }
}

function gameOver() {
  pause();
  var emojiMode = document.querySelector('.mode');
  var message = document.querySelector('.msg');
  if (isWin) {
    message.innerHTML = 'Well done! You won!';
    emojiMode.innerHTML = WIN_EMOJI;
    gCurrentEmoji = WIN_EMOJI;
    var currScore = parseInt(localStorage.getItem('bestScore'));
    if (!currScore || elapsedTime < currScore) {
      localStorage.setItem('bestScore', elapsedTime);
    }
    updateRecord();
    gGame.isOn = false;
  } else if (!isWin & gNumberOfLife === 0) {
    message.innerHTML = 'Game over, try again';
    emojiMode.innerHTML = LOSE_EMOJI;
    gCurrentEmoji = LOSE_EMOJI;
    openAllCellsAfterLose();
    gGame.isOn = false;
  } else {
    emojiMode.innerHTML = LOSE_life_EMOJI;
    gCurrentEmoji = LOSE_life_EMOJI;
    var arrow = document.querySelector(`.arrow${gNumberOfLife}`);
    arrow.style.display = 'block';
  }
}

function restart() {
  updateRecord();
  var elSafeCount = document.querySelector('.safe-counter');
  var message = document.querySelector('.msg');
  message.innerHTML = '';
  gGame.markedCount = 0;
  gGame.shownCount = 0;
  gNumberOfLife = 3;
  gSafeRemaining = 3;
  elSafeCount.innerHTML = `${gSafeRemaining} more`;
  gCurrentEmoji = REGULAR_EMOJI;
  var emojiMode = document.querySelector('.mode');
  emojiMode.innerHTML = gCurrentEmoji;
  restartToLives();
  restartToHints();
  resetTimer();
  init();
}

function checkWin() {
  if (gGame.shownCount === (gLevel.SIZE * gLevel.SIZE) && gGame.markedCount === gLevel.MINES) {
    isWin = true;
    gameOver();
  } else return;
}

function lifeSafe(btn) {
  if (gGame.isOn === true) return;
  renderCell(gCurrMine, '');
  var emojiMode = document.querySelector('.mode');
  var arrow = document.querySelector(`.arrow${gNumberOfLife}`);
  emojiMode.innerHTML = REGULAR_EMOJI;
  gCurrentEmoji = REGULAR_EMOJI;
  btn.classList.add('hide');
  arrow.style.display = 'none';
  gNumberOfLife--;
  gGame.isOn = true
  start();
}

function restartToLives() {
  var firstLife = document.querySelector(`.firstLife`);
  var secondLife = document.querySelector('.secondLife');
  var threeLife = document.querySelector('.threeLife');
  firstLife.classList.remove('hide');
  secondLife.classList.remove('hide');
  threeLife.classList.remove('hide');
}

function hintsSupport(btn) {
  isHint = true;
  btn.classList.add('hide');
}

function restartToHints() {
  isHint = false;
  var hint1 = document.querySelector(`.hint1`);
  var hint2 = document.querySelector('.hint2');
  var hint3 = document.querySelector('.hint3');
  hint1.classList.remove('hide');
  hint2.classList.remove('hide');
  hint3.classList.remove('hide');
}

function openAllCellsAfterLose() {
  renderMineCell(gMinesLocations, MINE);
}

function openNeighbors(location) {
  var neighbors = findNeighbors(location);
  for (var index = 0; index < neighbors.length; index++) {
    hintsNeighbors(neighbors[index])
  }
}

function onSafeClicked() {
  if (gSafeRemaining === 0) return;
  var safeCellLocation = getSafeCell();
  var elSafeCell = document.querySelector(`#cell${safeCellLocation.i}-${safeCellLocation.j}`);
  elSafeCell.classList.add('light-cell');
  setTimeout(() => elSafeCell.classList.remove('light-cell'), 4000)
  var elSafeCount = document.querySelector('.safe-counter');
  gSafeRemaining--;
  elSafeCount.innerHTML = `${gSafeRemaining} more`;
}

function getSafeCell() {
  if (gSafeRemaining === 0) return;
  var safePlaceArray = [];
  for (let index = 0; index < gLevel.SIZE; index++) {
    for (let jIndex = 0; jIndex < gLevel.SIZE; jIndex++) {
      if (gBoard[index][jIndex].isMine === false && gBoard[index][jIndex].isShown === false) {
        safePlaceArray.push({ i: index, j: jIndex })
      }
    }
  }
  var randomNum = getRandomInt(0, safePlaceArray.length);
  var safeCellLocation = safePlaceArray[randomNum];
  return safeCellLocation;
}

// function restartToLives() {
//   var firstLife = document.querySelector(`.firstLife`);
//   var secondLife = document.querySelector('.secondLife');
//   var threeLife = document.querySelector('.threeLife');
//   firstLife.classList.remove('hide');
//   secondLife.classList.remove('hide');
//   threeLife.classList.remove('hide');
// }

function updateRecord() {
  var elRecord = document.querySelector('.record');
  var currScore = parseInt(localStorage.getItem('bestScore'));
  var currScoreString = timeToString(currScore);
  elRecord.innerHTML = `record: ${currScoreString}`;
}
