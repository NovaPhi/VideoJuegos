/* 
Juego Breakout en html/JS
Luis Arias
10-Marzo-26
*/

"use strict";

const canvasWidth = 1000;
const canvasHeight = 750;
const paddleSpeed = 7;

// Grid dimensions for the block layout
const BLOCK_COLS = 12;
const BLOCK_ROWS = 4;

let ctx;
let game;

// Handles the ball's position, movement, and rendering
class Ball {
    constructor() {
        this.radius = 15;
        this.image = new Image();
        this.image.src = "FIREBALL.png";
        this.reset();
    }

    // Returns ball to starting position with default velocity
    reset() {
        this.x = canvasWidth / 2;
        this.y = canvasHeight - 120;
        this.vx = 3;
        this.vy = -10;
    }

    // Moves the ball and bounces off left, right, and top walls
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x - this.radius < 0)           { this.x = this.radius;               this.vx *= -1; }
        if (this.x + this.radius > canvasWidth) { this.x = canvasWidth - this.radius; this.vx *= -1; }
        if (this.y - this.radius < 0)           { this.y = this.radius;               this.vy *= -1; }
    }

    // Returns true if the ball has fallen below the canvas
    isLost() {
        return this.y - this.radius > canvasHeight;
    }

    // Draws the ball sprite, falls back to a white circle if image not loaded
    draw(ctx) {
        if (this.image && this.image.complete && this.image.naturalWidth > 0) {
            ctx.drawImage(this.image, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = "white";
            ctx.fill();
        }
    }
}

// Handles the player-controlled paddle
class Paddle {
    constructor() {
        this.width = 200;
        this.height = 12;
        this.x = (canvasWidth - this.width) / 2;
        this.y = canvasHeight - 40;
        this.keys = { left: false, right: false };
        this.setSprite("paddle.png");
    }

    // Loads a sprite image for the paddle
    setSprite(path) {
        this.image = new Image();
        this.image.src = path;
    }

    // Moves the paddle based on A/D keys, clamped within canvas bounds
    update() {
        if (this.keys.left)  this.x -= paddleSpeed;
        if (this.keys.right) this.x += paddleSpeed;
        this.x = Math.max(0, Math.min(canvasWidth - this.width, this.x));
    }

    // Returns true if the ball is colliding with the paddle
    isHit(ball) {
        return (
            ball.y + ball.radius >= this.y &&
            ball.y - ball.radius <= this.y + this.height &&
            ball.x >= this.x &&
            ball.x <= this.x + this.width
        );
    }

    // Draws the paddle sprite, falls back to a blue rectangle if image not loaded
    draw(ctx) {
        if (this.image && this.image.complete && this.image.naturalWidth > 0) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = "#4af";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

// Represents a single destructible block in the grid
class Block {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 70;
        this.height = 22;
        this.alive = true;
    }

    // Loads a sprite image for the block
    setSprite(path) {
        this.image = new Image();
        this.image.src = path;
    }

    // Returns true if the ball hit this block, destroys it and bounces the ball
    checkHit(ball) {
        if (!this.alive) return false;
        if (
            ball.x + ball.radius > this.x &&
            ball.x - ball.radius < this.x + this.width &&
            ball.y + ball.radius > this.y &&
            ball.y - ball.radius < this.y + this.height
        ) {
            this.alive = false;
            ball.vy *= -1;
            return true;
        }
        return false;
    }

    // Draws the block sprite, falls back to a red rectangle if image not loaded
    draw(ctx) {
        if (!this.alive) return;
        if (this.image && this.image.complete && this.image.naturalWidth > 0) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = "#f55";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

// Main game class — manages state, objects, input, and the game loop logic
class Game {
    constructor() {
        this.ball    = new Ball();
        this.paddle  = new Paddle();
        this.blocks  = [];
        this.lives           = 3;
        this.blocksDestroyed = 0;
        this.over    = false;
        this.won     = false;
        this.waiting = true;

        this.buildBlocks();
        this.createEventListeners();
    }

    // Populates the blocks array in a grid using BLOCK_COLS and BLOCK_ROWS
    buildBlocks() {
        const cols = BLOCK_COLS, rows = BLOCK_ROWS;
        const blockW = 70, blockH = 22;
        const padX = 10, padY = 10;
        const offsetX = 45, offsetY = 60;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = offsetX + col * (blockW + padX);
                const y = offsetY + row * (blockH + padY);
                const block = new Block(x, y);
                block.setSprite("Block.png");
                this.blocks.push(block);
            }
        }
    }

    // Starts the game from the waiting screen, or resets everything after win/loss
    startOrRestart() {
        if (this.waiting) {
            this.waiting = false;
        } else if (this.over || this.won) {
            this.ball    = new Ball();
            this.paddle  = new Paddle();
            this.blocks  = [];
            this.lives           = 3;
            this.blocksDestroyed = 0;
            this.over    = false;
            this.won     = false;
            this.waiting = false;
            this.buildBlocks();
        }
    }

    // Registers keyboard events for paddle movement and spacebar to start/restart
    createEventListeners() {
        window.addEventListener("keydown", (e) => {
            if (e.code === "Space") this.startOrRestart();
            if (e.code === "KeyA")  this.paddle.keys.left  = true;
            if (e.code === "KeyD")  this.paddle.keys.right = true;
        });
        window.addEventListener("keyup", (e) => {
            if (e.code === "KeyA")  this.paddle.keys.left  = false;
            if (e.code === "KeyD")  this.paddle.keys.right = false;
        });
    }

    // Updates all game objects and checks collisions, win, and loss conditions
    update() {
        if (this.waiting || this.over || this.won) return;

        this.paddle.update();
        this.ball.update();

        // Bounce ball off paddle with spin based on hit position
        if (this.paddle.isHit(this.ball)) {
            this.ball.vy = -Math.abs(this.ball.vy);
            const hitPos = (this.ball.x - this.paddle.x) / this.paddle.width;
            this.ball.vx = (hitPos - 0.5) * 8;
        }

        // Check ball against every block
        for (const block of this.blocks) {
            if (block.checkHit(this.ball)) {
                this.blocksDestroyed++;
            }
        }

        // Lose a life if ball falls off the bottom
        if (this.ball.isLost()) {
            this.lives--;
            if (this.lives <= 0) {
                this.over = true;
            } else {
                this.ball.reset();
            }
        }

        // Win when all blocks are destroyed
        if (this.blocks.every(b => !b.alive)) {
            this.won = true;
        }
    }

    // Draws all game objects, the HUD, and any active overlay
    draw(ctx) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        for (const block of this.blocks) block.draw(ctx);
        this.paddle.draw(ctx);
        this.ball.draw(ctx);

        // HUD: lives and block counter
        ctx.fillStyle = "black";
        ctx.font = "16px monospace";
        ctx.textAlign = "left";
        ctx.fillText(`Lives: ${this.lives}`, 10, 25);
        ctx.fillText(`Blocks: ${this.blocksDestroyed}`, 10, 48);

        if (this.waiting) {
            this.drawOverlay("BREAKOUT", "PRESS SPACE TO START", "white");
        } else if (this.over) {
            this.drawOverlay("GAME OVER", "PRESS SPACE TO RESTART", "white");
        } else if (this.won) {
            this.drawOverlay("YOU WIN!", "PRESS SPACE TO PLAY AGAIN", "lime");
        }
    }

    // Draws a semi-transparent overlay with a title and subtitle
    drawOverlay(title, subtitle, color) {
        ctx.fillStyle = "rgba(86, 196, 230, 0.6)";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.textAlign = "center";
        ctx.fillStyle = color;
        ctx.font = "56px monospace";
        ctx.fillText(title, canvasWidth / 2, canvasHeight / 2 - 20);
        ctx.fillStyle = "white";
        ctx.font = "22px monospace";
        ctx.fillText(subtitle, canvasWidth / 2, canvasHeight / 2 + 30);
    }
}

// Initializes the canvas and starts the game
function main() {
    const canvas = document.getElementById("canvas");
    canvas.width  = canvasWidth;
    canvas.height = canvasHeight;
    ctx = canvas.getContext("2d");
    game = new Game();
    loop();
}

// Main loop — called every frame via requestAnimationFrame
function loop() {
    game.update();
    game.draw(ctx);
    requestAnimationFrame(loop);
}