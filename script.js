const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const currentScoreDisplay = document.getElementById('currentScore');
const highScoreDisplay = document.getElementById('highScoreDisplay');

const GRID_SIZE = 20;
const INITIAL_SNAKE_LENGTH = 4;
let snake = [];
for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
    snake.push({ x: (15 - i) * GRID_SIZE, y: 10 * GRID_SIZE });
}
let food = getRandomFoodPosition();
let direction = { x: 1, y: 0 };
let score = 0;
let gameInterval;
const GAME_SPEED = 150;
let highScore = localStorage.getItem('highScore') || 0;
let gameJustRestarted = false;

// Load images
const snakeHeadImg = new Image();
snakeHeadImg.src = 'assets/snake-head-20x20.gif';
const foodImg = new Image();
foodImg.src = 'assets/snake-food-32x32.gif';

// Initialize high score display on load
highScoreDisplay.textContent = `High Score: ${highScore}`;

function getRandomFoodPosition() {
    const x = Math.floor(Math.random() * (canvas.width / GRID_SIZE)) * GRID_SIZE;
    const y = Math.floor(Math.random() * (canvas.height / GRID_SIZE)) * GRID_SIZE;
    return { x, y };
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawFood();
    drawSnake();
    // drawScore(); // Remove drawing score on canvas
}

function drawSnake() {
    snake.forEach((segment, index) => {
        const isHead = index === snake.length - 1;
        const centerX = segment.x + GRID_SIZE / 2;
        const centerY = segment.y + GRID_SIZE / 2;

        if (isHead) {
            ctx.drawImage(snakeHeadImg, segment.x, segment.y, GRID_SIZE, GRID_SIZE);
        } else {
            ctx.fillStyle = '#009ef1';
            ctx.beginPath();
            ctx.arc(centerX, centerY, GRID_SIZE / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#0080c7';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });
}

function drawFood() {
    ctx.drawImage(foodImg, food.x, food.y, 32, 32);
}

function moveSnake() {
    const head = { ...snake[snake.length - 1] };
    head.x += direction.x * GRID_SIZE;
    head.y += direction.y * GRID_SIZE;
    snake.push(head);
    snake.shift();
}

function checkCollision() {
    const head = snake[snake.length - 1];
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        return true;
    }
    for (let i = 0; i < snake.length - 1; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}

function update() {
    moveSnake();

    if (!gameJustRestarted) {
        if (checkCollision()) {
            gameOver();
            return;
        }
    } else {
        gameJustRestarted = false;
    }

    if (headEatsFood()) {
        score++;
        food = getRandomFoodPosition();
        const newHead = { ...snake[0] };
        newHead.x -= direction.x * GRID_SIZE;
        newHead.y -= direction.y * GRID_SIZE;
        snake.unshift(newHead);
        updateScoreDisplay(); // Update the HTML score display
        updateHighScore();
    }

    draw();
}

function headEatsFood() {
    const head = snake[snake.length - 1];
    return head.x < food.x + 32 && head.x + GRID_SIZE > food.x &&
           head.y < food.y + 32 && head.y + GRID_SIZE > food.y;
}

function changeDirection(e) {
    if (e.key === 'ArrowUp' && direction.y === 0) {
        direction = { x: 0, y: -1 };
    } else if (e.key === 'ArrowDown' && direction.y === 0) {
        direction = { x: 0, y: 1 };
    } else if (e.key === 'ArrowLeft' && direction.x === 0) {
        direction = { x: -1, y: 0 };
    } else if (e.key === 'ArrowRight' && direction.x === 0) {
        direction = { x: 1, y: 0 };
    }
}

function updateScoreDisplay() {
    currentScoreDisplay.textContent = `Score: ${score}`;
}

function gameOver() {
    clearInterval(gameInterval);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, canvas.height / 4, canvas.width, canvas.height / 2);
    ctx.fillStyle = 'white';
    ctx.font = '30px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Game Over! Score: ${score}`, canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillText(`Press Space to Restart`, canvas.width / 2, canvas.height / 2 + 20);
    document.addEventListener('keydown', handleRestart);
}

function handleRestart(e) {
    if (e.key === ' ') {
        restartTheGame();
        document.removeEventListener('keydown', handleRestart);
    }
}

function restartTheGame() {
    snake = [];
    for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
        snake.push({ x: (15 - i) * GRID_SIZE, y: 10 * GRID_SIZE });
    }
    food = getRandomFoodPosition();
    direction = { x: 1, y: 0 };
    score = 0;
    updateScoreDisplay(); // Reset score display
    clearInterval(gameInterval);
    gameInterval = setInterval(update, GAME_SPEED);
    gameJustRestarted = true;
    draw();
}

function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        highScoreDisplay.textContent = `High Score: ${highScore}`; // Update display
    }
}

document.addEventListener('keydown', changeDirection);
gameInterval = setInterval(update, GAME_SPEED);
draw();
updateScoreDisplay(); // Initial score display