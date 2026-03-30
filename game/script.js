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
    startBtn.style.display = "none";
});

// player movement
function move(direction){
    if(gameOver) return;
    if(direction==='up' && playerY>0) playerY-=20;
    if(direction==='down' && playerY<360) playerY+=20;
    if(direction==='left' && playerX>0) playerX-=20;
    if(direction==='right' && playerX<360) playerX+=20;
    player.style.top = playerY + "px";
    player.style.left = playerX + "px";
}

// keyboard support
document.addEventListener("keydown", (e)=>{
    if(gameOver) return;
    if(e.key==="ArrowUp") move("up");
    if(e.key==="ArrowDown") move("down");
    if(e.key==="ArrowLeft") move("left");
    if(e.key==="ArrowRight") move("right");
});

// enemy creation
const badMonsters = ['😈','👿','👹','💀','☠️','🧟','🦹','😡','🤬','👺','👽','👾','🤖'];
const goodMonsters = ['😊','🙂','😇','😺','😄'];

function createEnemy(){
    if(gameOver) return;

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
                bgMusic.pause();
                gameOver = true;
                setTimeout(()=>{
                    alert('GAME OVER! SCORE: ' + score);
                    location.reload();
                }, 200);
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
    if(!gameOver){
        time++;
        if(timerDisplay) timerDisplay.textContent = time;

        if(time % 5 === 0) speed += 0.1;
        if(time % 10 === 0 && bgMusic && bgMusic.playbackRate < 2) bgMusic.playbackRate += 0.1;
    }
}, 1000);

// spawn enemy
setInterval(()=>{
    if(!gameOver) createEnemy();
}, 900);
