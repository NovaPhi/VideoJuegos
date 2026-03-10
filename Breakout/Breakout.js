/* 
Juego Breakout en html/JS
Luis Arias
10-Marzo-26
*/

"use strict";

const canvasWidth = 1000;
const canvasHeight = 750;
const paddleSpeed = 7;

const BLOCK_COLS = 12;
const BLOCK_ROWS = 4;

let ctx;
let game;

class Ball {
    constructor() {
        this.radius = 15;
        this.image = new Image();
        this.image.src = "FIREBALL.png";
        this.reset();
    }

    reset() {
        this.x = canvasWidth / 2;
        this.y = canvasHeight - 120;
        this.vx = 3;
        this.vy = -10;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x - this.radius < 0)           { this.x = this.radius;               this.vx *= -1; }
        if (this.x + this.radius > canvasWidth) { this.x = canvasWidth - this.radius; this.vx *= -1; }
        if (this.y - this.radius < 0)           { this.y = this.radius;               this.vy *= -1; }
    }

    isLost() {
        return this.y - this.radius > canvasHeight;
    }

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

class Paddle {
    constructor() {
        this.width = 200;
        this.height = 12;
        this.x = (canvasWidth - this.width) / 2;
        this.y = canvasHeight - 40;
        this.keys = { left: false, right: false };
        this.setSprite("paddle.png");
    }

    setSprite(path) {
        this.image = new Image();
        this.image.src = path;
    }

    update() {
        if (this.keys.left)  this.x -= paddleSpeed;
        if (this.keys.right) this.x += paddleSpeed;
        this.x = Math.max(0, Math.min(canvasWidth - this.width, this.x));
    }

    isHit(ball) {
        return (
            ball.y + ball.radius >= this.y &&
            ball.y - ball.radius <= this.y + this.height &&
            ball.x >= this.x &&
            ball.x <= this.x + this.width
        );
    }

    draw(ctx) {
        if (this.image && this.image.complete && this.image.naturalWidth > 0) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = "#4af";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

class Block {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 70;
        this.height = 22;
        this.alive = true;
    }

    setSprite(path) {
        this.image = new Image();
        this.image.src = path;
    }

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

    update() {
        if (this.waiting || this.over || this.won) return;

        this.paddle.update();
        this.ball.update();

        if (this.paddle.isHit(this.ball)) {
            this.ball.vy = -Math.abs(this.ball.vy);
            const hitPos = (this.ball.x - this.paddle.x) / this.paddle.width;
            this.ball.vx = (hitPos - 0.5) * 8;
        }

        for (const block of this.blocks) {
            if (block.checkHit(this.ball)) {
                this.blocksDestroyed++;
            }
        }

        if (this.ball.isLost()) {
            this.lives--;
            if (this.lives <= 0) {
                this.over = true;
            } else {
                this.ball.reset();
            }
        }

        if (this.blocks.every(b => !b.alive)) {
            this.won = true;
        }
    }

    draw(ctx) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        for (const block of this.blocks) block.draw(ctx);
        this.paddle.draw(ctx);
        this.ball.draw(ctx);

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

function main() {
    const canvas = document.getElementById("canvas");
    canvas.width  = canvasWidth;
    canvas.height = canvasHeight;
    ctx = canvas.getContext("2d");
    game = new Game();
    loop();
}

function loop() {
    game.update();
    game.draw(ctx);
    requestAnimationFrame(loop);
}