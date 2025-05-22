let boxes = document.querySelectorAll(".box");
let resetBtn = document.querySelector("#reset-btn");
let newGameBtn = document.querySelector("#new-btn");
let msgContainer = document.querySelector(".msg-container");
let msg = document.querySelector("#msg");

// Score tracking
let playerOScore = 0;
let playerXScore = 0;
let drawScore = 0;

const playerOScoreEl = document.getElementById("playerO-score");
const playerXScoreEl = document.getElementById("playerX-score");
const drawScoreEl = document.getElementById("draws-score");

function updateScores() {
  playerOScoreEl.textContent = playerOScore;
  playerXScoreEl.textContent = playerXScore;
  drawScoreEl.textContent = drawScore;
}

// Game mode and state
let isTwoPlayer = true;
let turnO = true;
let count = 0;

const aiPlayer = "X";
const huPlayer = "O";

const winPatterns = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

// DOM elements
const twoPlayerBtn = document.getElementById("two-player");
const vsAiBtn = document.getElementById("vs-ai");
const gameBoard = document.getElementById("game-board");
const modeSelect = document.getElementById("mode-select");

// Initial setup
updateScores();

// Event listeners
twoPlayerBtn.addEventListener("click", () => {
  isTwoPlayer = true;
  modeSelect.classList.add("hide");
  gameBoard.classList.remove("hide");
});

vsAiBtn.addEventListener("click", () => {
  isTwoPlayer = false;
  modeSelect.classList.add("hide");
  gameBoard.classList.remove("hide");
});

resetBtn.addEventListener("click", resetGame);
newGameBtn.addEventListener("click", resetGame);

boxes.forEach((box) => {
  box.addEventListener("click", () => {
    if (box.innerText !== "") return;

    box.innerText = turnO ? "O" : "X";
    box.disabled = true;
    count++;

    let isWinner = checkWinner();

    if (count === 9 && !isWinner) {
      gameDraw();
      return;
    }

    if (isWinner) return;

    turnO = !turnO;

    if (!isTwoPlayer && !turnO) {
      setTimeout(aiMove, 500); // AI plays as X
    }
  });
});

function aiMove() {
  const bestMove = minimax(boxes, aiPlayer);
  if (bestMove.index !== -1) {
    const box = boxes[bestMove.index];
    box.innerText = aiPlayer;
    box.disabled = true;
    count++;
    let isWinner = checkWinner();

    if (count === 9 && !isWinner) {
      gameDraw();
    }

    turnO = true;
  }
}

function minimax(newBoard, player) {
  let availSpots = getAvailableBoxes(newBoard);

  const winningPlayer = checkWin(newBoard);
  if (winningPlayer === huPlayer) return { score: -10 };
  else if (winningPlayer === aiPlayer) return { score: 10 };
  else if (availSpots.length === 0) return { score: 0 };

  let moves = [];

  for (let i = 0; i < availSpots.length; i++) {
    let move = {};
    move.index = availSpots[i];
    newBoard[availSpots[i]].innerText = player;

    if (player === aiPlayer) {
      let result = minimax(newBoard, huPlayer);
      move.score = result.score;
    } else {
      let result = minimax(newBoard, aiPlayer);
      move.score = result.score;
    }

    newBoard[availSpots[i]].innerText = "";
    moves.push(move);
  }

  let bestMove;
  if (player === aiPlayer) {
    let bestScore = -Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }

  return moves[bestMove];
}

function getAvailableBoxes(board) {
  let available = [];
  board.forEach((box, idx) => {
    if (box.innerText === "") available.push(idx);
  });
  return available;
}

function checkWin(board) {
  for (let pattern of winPatterns) {
    let [a, b, c] = pattern;
    if (
      board[a].innerText &&
      board[a].innerText === board[b].innerText &&
      board[b].innerText === board[c].innerText
    ) {
      return board[a].innerText;
    }
  }
  return null;
}

function checkWinner() {
  let winner = checkWin(boxes);
  if (winner) showWinner(winner);
  return winner !== null;
}

function disableBoxes() {
  boxes.forEach((box) => (box.disabled = true));
}

function enableBoxes() {
  boxes.forEach((box) => {
    box.disabled = false;
    box.innerText = "";
    box.classList.remove("win");
  });
}

function resetGame() {
  turnO = true;
  count = 0;
  enableBoxes();
  msgContainer.classList.add("hide");

  gameBoard.classList.add("hide");
  modeSelect.classList.remove("hide");
}

function showWinner(winner) {
  msg.innerText = `Congratulations, Winner is ${winner}`;
  msgContainer.classList.remove("hide");

  if (winner === "O") playerOScore++;
  else playerXScore++;

  updateScores();
  highlightWinningBoxes();
  disableBoxes();
}

function gameDraw() {
  msg.innerText = `Game was a Draw.`;
  msgContainer.classList.remove("hide");
  drawScore++;
  updateScores();
  disableBoxes();
}

function highlightWinningBoxes() {
  for (let pattern of winPatterns) {
    let [a, b, c] = pattern;
    if (
      boxes[a].innerText &&
      boxes[a].innerText === boxes[b].innerText &&
      boxes[b].innerText === boxes[c].innerText
    ) {
      boxes[a].classList.add("win");
      boxes[b].classList.add("win");
      boxes[c].classList.add("win");
    }
  }
}