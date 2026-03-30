// ==================== GLOBAL ====================
const bgMusic = document.getElementById("bgMusic");
const clickSound = document.getElementById("clickSound");
const winSound = document.getElementById("winSound");
const loseSound = document.getElementById("loseSound");

function startGame(gameId) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(gameId).classList.add("active");
    bgMusic.play().catch(e => console.log("Audio play failed"));
    if (gameId === 'cards') initCardGame();
    if (gameId === 'tictac') buildTicBoard();
}

function goHome() {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById("home").classList.add("active");
    bgMusic.pause();
}

// ==================== MEMORY GAME ====================
let memPattern = [];
let userPattern = [];
let memActive = false;
let memLevel = 0;
let memScore = 0;

function playMemory() {
    userPattern = [];
    const colors = ["green", "red", "yellow", "blue"];
    const color = colors[Math.floor(Math.random() * 4)];
    memPattern.push(color);
    memLevel++;
    memScore = memLevel * 10;
    
    document.getElementById("memLevel").textContent = memLevel;
    document.getElementById("memScore").textContent = memScore;
    
    playSequence();
}

function playSequence() {
    memActive = false;
    let delay = 500;
    memPattern.forEach((color, index) => {
        setTimeout(() => {
            showColor(color);
        }, delay + index * 800);
    });
    // enable user input after sequence completes
    const total = 500 + (memPattern.length - 1) * 800 + 350;
    setTimeout(() => { memActive = true; }, total);
}

function showColor(color) {
    const box = document.querySelector(`[data-color="${color}"]`);
    box.style.transform = "scale(0.9)";
    box.style.opacity = "0.7";
    try { clickSound.play().catch(e => {}); } catch(e) {}
    
    setTimeout(() => {
        box.style.transform = "scale(1)";
        box.style.opacity = "1";
    }, 300);
}

document.getElementById("memStart").addEventListener("click", () => {
    memActive = true;
    memPattern = [];
    userPattern = [];
    memLevel = 0;
    memScore = 0;
    document.getElementById("memLevel").textContent = "0";
    document.getElementById("memScore").textContent = "0";
    playMemory();
});

document.getElementById("memReset").addEventListener("click", () => {
    memActive = false;
    memPattern = [];
    userPattern = [];
    memLevel = 0;
    memScore = 0;
    document.getElementById("memLevel").textContent = "0";
    document.getElementById("memScore").textContent = "0";
    alert("Game Reset!");
});

document.querySelectorAll("[data-color]").forEach(box => {
    box.addEventListener("click", () => {
        if (!memActive) return;
        
        const color = box.dataset.color;
        userPattern.push(color);
        showColor(color);
        
        if (userPattern[userPattern.length - 1] !== memPattern[userPattern.length - 1]) {
            memActive = false;
            try { loseSound.play().catch(e=>{}); } catch(e){}
            alert(`Game Over! You reached Level ${memLevel}. Score: ${memScore}`);
            memPattern = [];
            userPattern = [];
            return;
        }
        
        if (userPattern.length === memPattern.length) {
            memActive = false;
            setTimeout(playMemory, 1000);
        }
    });
});

// ==================== TIC TAC TOE ====================
let ticBoard = [];
let ticCurrent = "X";
let xScore = 0;
let oScore = 0;

function buildTicBoard() {
    ticBoard = ["", "", "", "", "", "", "", "", ""];
    ticCurrent = "X";
    document.getElementById("currentTurn").textContent = "X";
    
    const grid = document.getElementById("ticBoard");
    grid.innerHTML = "";
    
    ticBoard.forEach((_, i) => {
        const cell = document.createElement("div");
        cell.className = "tic-cell";
        cell.addEventListener("click", () => clickTicCell(i, cell));
        grid.appendChild(cell);
    });
}

function clickTicCell(index, cell) {
    if (ticBoard[index] !== "") return;
    
    ticBoard[index] = ticCurrent;
    cell.textContent = ticCurrent;
    cell.style.color = ticCurrent === "X" ? "#e74c3c" : "#3498db";
    
    if (checkWin(ticCurrent)) {
        try { winSound.play().catch(e => {}); } catch(e) {}
        if (ticCurrent === "X") xScore++;
        else oScore++;
        
        document.getElementById("xWins").textContent = xScore;
        document.getElementById("oWins").textContent = oScore;
        
        alert(`${ticCurrent} Wins!`);
        buildTicBoard();
        return;
    }
    
    if (ticBoard.every(c => c !== "")) {
        try { loseSound.play().catch(e=>{}); } catch(e){}
        alert("Draw!");
        buildTicBoard();
        return;
    }
    
    ticCurrent = ticCurrent === "X" ? "O" : "X";
    document.getElementById("currentTurn").textContent = ticCurrent;
}

function checkWin(player) {
    const wins = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];
    return wins.some(combo => combo.every(i => ticBoard[i] === player));
}

document.getElementById("ticStart").addEventListener("click", buildTicBoard);
document.getElementById("ticReset").addEventListener("click", () => {
    xScore = 0;
    oScore = 0;
    document.getElementById("xWins").textContent = "0";
    document.getElementById("oWins").textContent = "0";
    buildTicBoard();
});

// ==================== CARD MATCH ====================
const fruits = ["🍎", "🍌", "🍇", "🍓", "🍒", "🥝", "🍍", "🥭", "🍑", "🍉"];
let cardFirst = null;
let cardSecond = null;
let cardLocked = false;
let cardMatches = 0;
let cardTime = 0;
let cardTimer = null;

function initCardGame() {
    cardFirst = null;
    cardSecond = null;
    cardLocked = false;
    cardMatches = 0;
    cardTime = 0;
    
    document.getElementById("cardMatches").textContent = "0";
    document.getElementById("cardTime").textContent = "0";
    
    if (cardTimer) clearInterval(cardTimer);
    cardTimer = setInterval(() => {
        cardTime++;
        document.getElementById("cardTime").textContent = cardTime;
    }, 1000);
    
    const grid = document.getElementById("cardBoard");
    grid.innerHTML = "";
    
    let deck = [...fruits, ...fruits];
    shuffle(deck);
    
    deck.forEach(fruit => {
        const card = document.createElement("div");
        card.className = "card-item";
        card.textContent = "?";
        card.dataset.fruit = fruit;
        card.addEventListener("click", () => flipCard(card));
        grid.appendChild(card);
    });
}

function flipCard(card) {
    if (cardLocked || card.textContent !== "?") return;
    
    card.textContent = card.dataset.fruit;
    try { clickSound.play().catch(e => {}); } catch(e) {}
    
    if (!cardFirst) {
        cardFirst = card;
    } else {
        cardSecond = card;
        cardLocked = true;
        
        if (cardFirst.dataset.fruit === cardSecond.dataset.fruit) {
            try { winSound.play().catch(e => {}); } catch(e) {}
            cardMatches++;
            document.getElementById("cardMatches").textContent = cardMatches;
            cardFirst = null;
            cardSecond = null;
            cardLocked = false;
            
            if (cardMatches === 10) {
                clearInterval(cardTimer);
                try { winSound.play().catch(e => {}); } catch(e) {}
                alert(`🎉 You Won! ${cardTime} seconds!`);
            }
        } else {
            try { loseSound.play().catch(e=>{}); } catch(e){}
            setTimeout(() => {
                cardFirst.textContent = "?";
                cardSecond.textContent = "?";
                cardFirst = null;
                cardSecond = null;
                cardLocked = false;
            }, 800);
        }
    }
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

document.getElementById("cardStart").addEventListener("click", initCardGame);
document.getElementById("cardReset").addEventListener("click", () => {
    clearInterval(cardTimer);
    initCardGame();
});