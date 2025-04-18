// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const homeScreen = document.getElementById('homeScreen');
    const gameScreen = document.getElementById('gameScreen');
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Game variables
    const gridSize = 20; // Size of grid cells in pixels
    const gridWidth = canvas.width / gridSize; // Number of cells across
    const gridHeight = canvas.height / gridSize; // Number of cells down
    
    let snake = [
        {x: 10, y: 10}, // Head of the snake
    ];
    let food = {};
    let direction = 'right';
    let nextDirection = 'right';
    let score = 0;
    let gameRunning = false;
    let gameSpeed = 150; // Default speed (milliseconds between moves, lower = faster)
    let gameLoop;
    let currentDifficulty = 'medium'; // Default difficulty

    // DOM elements
    const scoreElement = document.getElementById('score');
    const finalScoreElement = document.getElementById('finalScore');
    const gameOverElement = document.getElementById('gameOver');
    const restartButton = document.getElementById('restartButton');
    const homeButton = document.getElementById('homeButton');
    const easyButton = document.getElementById('easyButton');
    const mediumButton = document.getElementById('mediumButton');
    const hardButton = document.getElementById('hardButton');
    const helpButton = document.getElementById('helpButton');
    const instructionsPopup = document.getElementById('instructionsPopup');
    const closePopupBtn = document.querySelector('.close-popup');
    
    // Difficulty settings
    const difficultySettings = {
        easy: {
            speed: 180,
            speedIncrease: 5,
            scorePerFood: 5
        },
        medium: {
            speed: 150,
            speedIncrease: 10,
            scorePerFood: 10
        },
        hard: {
            speed: 120,
            speedIncrease: 15,
            scorePerFood: 15
        }
    };

    // Background images
    let menuBackgroundImage = new Image();
    menuBackgroundImage.src = 'menu-bg.jpg';
    
    let gameBackgroundImage = new Image();
    gameBackgroundImage.src = 'gameplay-bg.jpg';
    
    gameBackgroundImage.onload = function() {
        draw();
    };

    // Initialize the game
    function initGame() {
        // Reset game state
        snake = [{x: 10, y: 10}];
        direction = 'right';
        nextDirection = 'right';
        score = 0;
        scoreElement.textContent = score;
        gameRunning = true;
        gameOverElement.style.display = 'none';
        
        // Set game speed based on difficulty
        gameSpeed = difficultySettings[currentDifficulty].speed;
        
        // Generate initial food
        generateFood();
        
        // Clear any existing game loop
        if (gameLoop) clearInterval(gameLoop);
        
        // Start game loop
        gameLoop = setInterval(gameStep, gameSpeed);
    }

    // Generate food at random position
    function generateFood() {
        // Generate random coordinates for food
        const x = Math.floor(Math.random() * gridWidth);
        const y = Math.floor(Math.random() * gridHeight);
        
        // Check if the food is on the snake
        const onSnake = snake.some(segment => segment.x === x && segment.y === y);
        
        // If food is on snake, try again
        if (onSnake) {
            return generateFood();
        }
        
        food = {x, y};
    }

    // Main game step function
    function gameStep() {
        if (!gameRunning) return;
        
        // Update direction from nextDirection
        direction = nextDirection;
        
        // Calculate new head position
        const head = {...snake[0]};
        
        switch (direction) {
            case 'up':
                head.y -= 1;
                break;
            case 'down':
                head.y += 1;
                break;
            case 'left':
                head.x -= 1;
                break;
            case 'right':
                head.x += 1;
                break;
        }
        
        // Check for collisions
        if (checkCollision(head)) {
            gameOver();
            return;
        }
        
        // Add new head to snake
        snake.unshift(head);
        
        // Check if snake ate food
        if (head.x === food.x && head.y === food.y) {
            // Increase score based on difficulty
            score += difficultySettings[currentDifficulty].scorePerFood;
            scoreElement.textContent = score;
            
            // Generate new food
            generateFood();
            
            // Increase speed slightly after every 5 food items
            if (score % 50 === 0 && gameSpeed > 50) {
                clearInterval(gameLoop);
                gameSpeed -= difficultySettings[currentDifficulty].speedIncrease;
                gameLoop = setInterval(gameStep, gameSpeed);
            }
        } else {
            // Remove tail if no food was eaten
            snake.pop();
        }
        
        // Draw everything
        draw();
    }

    // Check for collisions with walls or self
    function checkCollision(head) {
        // Check wall collisions
        if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
            return true;
        }
        
        // Check self collision (skip the last segment as it will be removed)
        for (let i = 0; i < snake.length - 1; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                return true;
            }
        }
        
        return false;
    }

    // Draw the game state to the canvas
    function draw() {
        // Clear the canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw background image for gameplay
        if (gameBackgroundImage.complete) {
            ctx.globalAlpha = 0.7; // Make it a bit transparent to ensure visibility of the snake
            ctx.drawImage(gameBackgroundImage, 0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 1.0;
        }
        
        // Only draw game elements if game is running or at game over screen
        if (gameRunning || gameOverElement.style.display === 'block') {
            // Draw snake
            snake.forEach((segment, index) => {
                // Use different color for head
                if (index === 0) {
                    ctx.fillStyle = '#FF0000'; // Red head
                } else {
                    ctx.fillStyle = '#FF4D4D'; // Lighter red body
                }
                
                ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1);
            });
            
            // Draw food
            ctx.fillStyle = '#FFFF00'; // Yellow food
            ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 1, gridSize - 1);
        }
    }

    // Game over function
    function gameOver() {
        gameRunning = false;
        clearInterval(gameLoop);
        finalScoreElement.textContent = score;
        gameOverElement.style.display = 'block';
    }

    // Show home screen function
    function showHomeScreen() {
        gameRunning = false;
        if (gameLoop) clearInterval(gameLoop);
        gameScreen.style.display = 'none';
        homeScreen.style.display = 'block';
        gameOverElement.style.display = 'none';
    }

    // Show game screen function
    function showGameScreen() {
        homeScreen.style.display = 'none';
        gameScreen.style.display = 'block';
        initGame();
    }

    // Handle keyboard input
    document.addEventListener('keydown', (event) => {
        // Only process keys if game is running
        if (!gameRunning) return;
        
        // Prevent the default action (scrolling) when pressing arrow keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            event.preventDefault();
        }
        
        // Update direction based on key press
        // Prevent 180-degree turns (e.g., can't go right if currently going left)
        switch (event.key) {
            case 'ArrowUp':
                if (direction !== 'down') nextDirection = 'up';
                break;
            case 'ArrowDown':
                if (direction !== 'up') nextDirection = 'down';
                break;
            case 'ArrowLeft':
                if (direction !== 'right') nextDirection = 'left';
                break;
            case 'ArrowRight':
                if (direction !== 'left') nextDirection = 'right';
                break;
        }
    });

    // Difficulty button event listeners
    easyButton.addEventListener('click', () => {
        currentDifficulty = 'easy';
        showGameScreen();
    });

    mediumButton.addEventListener('click', () => {
        currentDifficulty = 'medium';
        showGameScreen();
    });

    hardButton.addEventListener('click', () => {
        currentDifficulty = 'hard';
        showGameScreen();
    });

    // Handle restart button click
    restartButton.addEventListener('click', initGame);

    // Handle home button click
    homeButton.addEventListener('click', showHomeScreen);

    // Help button event listeners
    helpButton.addEventListener('click', () => {
        instructionsPopup.style.display = 'block';
    });
    
    closePopupBtn.addEventListener('click', () => {
        instructionsPopup.style.display = 'none';
    });
    
    // Close popup when clicking outside
    instructionsPopup.addEventListener('click', (e) => {
        if (e.target === instructionsPopup) {
            instructionsPopup.style.display = 'none';
        }
    });
    
    // Start with home screen
    showHomeScreen();
});