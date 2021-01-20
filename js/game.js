'use strict'
const MINE = '💣';
const FLAG = '🚩';
const WIN_EMOJI = '😎';
const LOSE_EMOJI = '😭';
const LOSE_life_EMOJI = '😞';
const REGULAR_EMOJI = '😊';
const BEGINNER = {
  size: 4,
  mines: 2
}
const MEDIUM = {
  size: 8,
  mines: 12
}
const EXPERT = {
  size: 12,
  mines: 30
}


var gCurrMine = null;
var gNumberOfLife;
var gCurrentEmoji;
var isWin;
var gMinesLocations;
var gCurrLevel = BEGINNER;
var gBoard;
var gLevel = {
  SIZE: gCurrLevel.size,
  MINES: gCurrLevel.mines
};
var gGame = {
  isOn: false,
  shownCount: 0, markedCount: 0, secsPassed: 0
}

function init() {
  gNumberOfLife = 3;
  gBoard = buildBoard(gLevel.SIZE);
  gMinesLocations = getRandomLocationOfMines(gLevel.SIZE, gLevel.MINES);
  renderBoard(gBoard);
  console.log(gBoard);
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

function setMinesNegsCount(location) {
  var neighborsCount = findNeighbors({ i: location.i, j: location.j });
  renderCell({ i: location.i, j: location.j }, neighborsCount);
  gBoard[location.i][location.j].minesAroundCount = neighborsCount;
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
  renderMinesInBoard();
}


function onCellClicked(elCell) {
  if (gGame.isOn === false) return;

  var id = elCell.getAttribute('id')
  var cellLocation = getCellById(id);
  var currCell = gBoard[cellLocation.i][cellLocation.j];

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
}

function getCellById(id) {
  var getCellId = id.split('cell')[1];
  var locationI = +getCellId.split('-')[0];
  var locationj = +getCellId.split('-')[1];
  var cellLocation = { i: locationI, j: locationj };
  return cellLocation;
}

function renderMinesInBoard() {
  for (var i = 0; i < gMinesLocations.length; i++) {
    gBoard[gMinesLocations[i].i][gMinesLocations[i].j].isMine = true;
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

function checkWin() {
  if (gGame.shownCount === (gLevel.SIZE * gLevel.SIZE) && gGame.markedCount === gLevel.MINES) {
    console.log('yes');
    isWin = true;
    gameOver();
  } else return;
}


function gameOver() {
  var emojiMode = document.querySelector('.mode');
  var message = document.querySelector('.msg');
  if (isWin) {
    message.innerHTML = 'Well done! You won!';
    emojiMode.innerHTML = WIN_EMOJI;
    gCurrentEmoji = WIN_EMOJI;
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
  var message = document.querySelector('.msg');
  message.innerHTML = '';
  gGame.markedCount = 0;
  gGame.shownCount = 0;
  gNumberOfLife = 3;
  gCurrentEmoji = REGULAR_EMOJI;
  var emojiMode = document.querySelector('.mode');
  emojiMode.innerHTML = gCurrentEmoji;
  restartToLives();
  init();
}

function lifeSafe(btn) {
  renderCell(gCurrMine, '');
  var emojiMode = document.querySelector('.mode');
  var arrow = document.querySelector(`.arrow${gNumberOfLife}`);
  emojiMode.innerHTML = REGULAR_EMOJI;
  gCurrentEmoji = REGULAR_EMOJI;
  btn.classList.add('hide-life');
  arrow.style.display = 'none';
  gNumberOfLife--;
  gGame.isOn = true
}

function openAllCellsAfterLose() {
  renderMineCell(gMinesLocations, MINE);
}

function restartToLives() {
  var firstLife = document.querySelector(`.firstLife`);
  var secondLife = document.querySelector('.secondLife');
  var threeLife = document.querySelector('.threeLife');
  firstLife.classList.remove('hide-life');
  secondLife.classList.remove('hide-life');
  threeLife.classList.remove('hide-life');
}
