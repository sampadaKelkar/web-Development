const player = document.getElementById("player"); 
const gameArea = document.getElementById("gameArea");
const timerDisplay = document.getElementById("timer");
const collisionSound = document.getElementById("collisionSound");
const bgMusic = document.getElementById("bgMusic");
const startBtn = document.getElementById("startBtn");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");

let score = 0;
let lives = 3;
let paused = false;

let playerX = 200 - 20;
let playerY = 200 - 20;
let speed = 2;
let time = 0;
let gameOver = true;

player.style.left = playerX + "px";
player.style.top = playerY + "px";

function updateLivesDisplay(){
    if(!livesDisplay) return;
    const full = '❤️';
    const empty = '🤍';
    const maxLives = 3;
    livesDisplay.textContent = full.repeat(Math.max(0, Math.min(lives, maxLives))) + empty.repeat(Math.max(0, maxLives - lives));
}

updateLivesDisplay();

// START GAME ON CLICK
startBtn.addEventListener("click", () => {
    bgMusic.volume = 0.4;
    bgMusic.currentTime = 0;
    bgMusic.loop = true;
    bgMusic.play().catch(()=>{});
    gameOver = false;
    paused = false;
    startBtn.style.display = "none";
    const pauseBtn = document.getElementById('pauseBtn');
    const muteBtn = document.getElementById('muteBtn');
    if(pauseBtn) pauseBtn.style.display = 'inline-block';
    if(muteBtn) muteBtn.style.display = 'inline-block';
});

// RESTART GAME ON PLAY AGAIN
const restartBtn = document.getElementById('restartBtn');
if(restartBtn) {
    restartBtn.addEventListener("click", () => {
        // Hide modal
        const modal = document.getElementById("gameOverModal");
        if(modal) modal.classList.remove('show');
        
        // Reset game state
        gameOver = true;
        paused = false;
        score = 0;
        lives = 3;
        time = 0;
        playerX = 200 - 20;
        playerY = 200 - 20;
        speed = 2;
        
        // Clear enemies
        const enemies = document.querySelectorAll('.enemy');
        enemies.forEach(enemy => enemy.remove());
        
        // Reset UI
        player.style.left = playerX + "px";
        player.style.top = playerY + "px";
        scoreDisplay.textContent = '0';
        if(timerDisplay) timerDisplay.textContent = '0';
        updateLivesDisplay();
        startBtn.style.display = "inline-block";
        
        const pauseBtn = document.getElementById('pauseBtn');
        const muteBtn = document.getElementById('muteBtn');
        if(pauseBtn) pauseBtn.style.display = 'none';
        if(muteBtn) muteBtn.style.display = 'none';
    });
}

// HOME BUTTON removed (no-op)
// OTHER GAMES BUTTON: navigate to the mini-game hub
const otherGamesBtn = document.getElementById('otherGamesBtn');
if(otherGamesBtn){
    otherGamesBtn.addEventListener('click', ()=>{
        // navigate to the mini-game hub (game2)
        window.location.href = '../../game2/codes/index.html';
    });
}

// player movement
function move(direction){
    if(gameOver || paused) return;
    if(direction==='up' && playerY>0) playerY-=20;
    if(direction==='down' && playerY<360) playerY+=20;
    if(direction==='left' && playerX>0) playerX-=20;
    if(direction==='right' && playerX<360) playerX+=20;
    player.style.top = playerY + "px";
    player.style.left = playerX + "px";
}

// keyboard support
document.addEventListener("keydown", (e)=>{
    if(gameOver || paused) return;
    if(e.key==="ArrowUp") move("up");
    if(e.key==="ArrowDown") move("down");
    if(e.key==="ArrowLeft") move("left");
    if(e.key==="ArrowRight") move("right");
});

// enemy creation
const badMonsters = ['😈','👿','👹','💀','☠️','🧟','😡','🤬','👺','👽','👾','🤖'];
const goodMonsters = ['😊','🙂','😇','😄'];

function createEnemy(){
    if(gameOver || paused) return;

    const enemy = document.createElement("div");
    enemy.classList.add("enemy");

    // 15% chance to spawn a good smiling emoji from the center
    const isGood = Math.random() < 0.15;
    if(isGood){
        enemy.textContent = goodMonsters[Math.floor(Math.random()*goodMonsters.length)];
    }else{
        enemy.textContent = badMonsters[Math.floor(Math.random()*badMonsters.length)];
    }

    let enemyX = isGood ? 180 : Math.floor(Math.random()*360);
    let enemyY = 0;

    enemy.style.left = enemyX + "px";
    enemy.style.top = enemyY + "px";
    gameArea.appendChild(enemy);

    function moveEnemy(){
        if(gameOver){
            enemy.remove();
            return;
        }

        if(paused){
            requestAnimationFrame(moveEnemy);
            return;
        }

        enemyY += speed;
        enemy.style.top = enemyY + "px";

        const playerRect = player.getBoundingClientRect();
        const enemyRect = enemy.getBoundingClientRect();

        if(
            playerRect.left < enemyRect.right &&
            playerRect.right > enemyRect.left &&
            playerRect.top < enemyRect.bottom &&
            playerRect.bottom > enemyRect.top
        ){
            // collision
            collisionSound.currentTime = 0;
            collisionSound.play().catch(()=>{});

            const emoji = enemy.textContent || '';
            enemy.remove();

            if(goodMonsters.includes(emoji)){
                // friendly pickup: restore one life (max 3)
                lives = Math.min(3, lives + 1);
                updateLivesDisplay();
                return;
            }

            // hit by bad enemy
            lives--;
            updateLivesDisplay();

            // hit animation
            player.classList.add('hit');
            setTimeout(()=> player.classList.remove('hit'), 300);

            if(lives <= 0){
                handleGameOver();
            }

            return;
        }

        if(enemyY < 400){
            requestAnimationFrame(moveEnemy);
        } else {
            // enemy left the play area: increment score
            enemy.remove();
            score++;
            if(scoreDisplay) scoreDisplay.textContent = score;
            if(scoreDisplay) {
                scoreDisplay.classList.add('pop');
                setTimeout(()=> scoreDisplay.classList.remove('pop'), 300);
            }
        }
    }

    moveEnemy();
}

// timer + speed
setInterval(()=>{
    if(!gameOver && !paused){
        time++;
        if(timerDisplay) timerDisplay.textContent = time;

        if(time % 5 === 0) speed += 0.1;
        if(time % 10 === 0 && bgMusic && bgMusic.playbackRate < 2) bgMusic.playbackRate += 0.1;
    }
}, 1000);

// spawn enemy
setInterval(()=>{
    if(!gameOver && !paused) createEnemy();
}, 900);

// Pause button
const pauseBtn = document.getElementById('pauseBtn');
if(pauseBtn){
    pauseBtn.addEventListener('click', ()=>{
        if(gameOver) return;
        paused = !paused;
        pauseBtn.textContent = paused ? 'Resume ▶️' : 'Pause ⏸️';
    });
}

// Mute button
const muteBtn = document.getElementById('muteBtn');
if(muteBtn){
    muteBtn.addEventListener('click', ()=>{
        const muted = !bgMusic.muted;
        bgMusic.muted = muted;
        collisionSound.muted = muted;
        muteBtn.textContent = muted ? 'Unmute 🔇' : 'Mute 🔈';
    });
}

// High score persistence
function getHighScores(){
    try{
        const raw = localStorage.getItem('dodge_high_scores');
        if(!raw) return [];
        return JSON.parse(raw);
    }catch(e){ return []; }
}

function saveScore(s){
    const scores = getHighScores();
    scores.push({score: s, date: Date.now()});
    scores.sort((a,b)=> b.score - a.score);
    const top = scores.slice(0,5);
    localStorage.setItem('dodge_high_scores', JSON.stringify(top));
}

function renderHighScores(){
    const list = document.getElementById('scoresList');
    if(!list) return;
    const scores = getHighScores();
    list.innerHTML = '';
    if(scores.length===0) list.innerHTML = '<li>No scores yet</li>';
    scores.forEach(s=>{
        const li = document.createElement('li');
        const d = new Date(s.date);
        li.textContent = `${s.score} — ${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
        list.appendChild(li);
    });
}

const showScoresBtn = document.getElementById('showScoresBtn');
const highScoresDiv = document.getElementById('highScores');
const closeScores = document.getElementById('closeScores');
if(showScoresBtn && highScoresDiv){
    showScoresBtn.addEventListener('click', ()=>{
        renderHighScores();
        highScoresDiv.style.display = 'block';
    });
}
if(closeScores && highScoresDiv){
    closeScores.addEventListener('click', ()=> highScoresDiv.style.display = 'none');
}

// Save score on game over: show modal instead of alert
function handleGameOver(win=false){
    bgMusic.pause();
    gameOver = true;

    saveScore(score);

    const modal = document.getElementById("gameOverModal");
    const finalScoreDisplay = document.getElementById("finalScore");
    const finalTimeDisplay = document.getElementById("finalTime");

    finalScoreDisplay.textContent = score;
    if(finalTimeDisplay) finalTimeDisplay.textContent = time;
    modal.classList.add('show');
}