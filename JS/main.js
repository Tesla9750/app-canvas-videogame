const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

function resizeCanvas() {
    const canvasContainer = document.getElementById("canvas-container");
    canvas.width = canvasContainer.clientWidth;
    canvas.height = canvasContainer.clientHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

canvas.style.background = "#000";

let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
highScore = parseInt(highScore);
let lives = 10;
let level = 1;

function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
        document.getElementById("highscore-display").textContent = highScore;
    }
}

class Circle {
    constructor(x, y, radius, color, textColor, text, speed) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.color = color;
        this.textColor = textColor;
        this.text = text;
        this.speed = speed;
        this.dx = 0;
        this.dy = -1 * this.speed;
        this.shouldBeRemoved = false;
    }

    draw(context) {
        context.beginPath();
        context.fillStyle = this.color;
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.fill();
        context.fillStyle = this.textColor;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "16px Arial";
        context.fillText(this.text, this.posX, this.posY);
        context.closePath();
    }

    update(context) {
        this.draw(context);
        if (this.posY - this.radius <= 0) {
            this.shouldBeRemoved = true;
            lives--;
            updateLivesDisplay();
            if (lives <= 0) {
                alert("Game Over");
                document.location.reload();
            }
        }
        this.posX += this.dx;
        this.posY += this.dy;
    }

    isPointInside(x, y) {
        const distance = getDistance(x, y, this.posX, this.posY);
        return distance < this.radius;
    }
}

function getDistance(posx1, posy1, posx2, posy2) {
    return Math.sqrt(Math.pow(posx2 - posx1, 2) + Math.pow(posy2 - posy1, 2));
}

let circlesArray = [];
let circlesDestroyed = 0;

function createCircle() {
    let circleCreated = false;
    while (!circleCreated) {
        let randomRadius = Math.floor(Math.random() * 60 + 35);
        let randomX = Math.random() * (canvas.width - 2 * randomRadius) + randomRadius;
        let randomY = canvas.height + randomRadius;
        let randomSpeed = Math.floor(Math.random() * 6) + 1;
        let creationValid = true;
        for (let j = 0; j < circlesArray.length; j++) {
            let distance = getDistance(randomX, randomY, circlesArray[j].posX, circlesArray[j].posY);
            if (distance < randomRadius + circlesArray[j].radius) {
                creationValid = false;
                break;
            }
        }
        if (creationValid) {
            circlesArray.push(new Circle(randomX, randomY, randomRadius, "#FF5733", "#FFF", "Circle", randomSpeed));
            circleCreated = true;
        }
    }
}

function increaseCircleSpeed() {
    for (let i = 0; i < circlesArray.length; i++) {
        circlesArray[i].speed += 1;
        circlesArray[i].dy = -1 * circlesArray[i].speed;
    }
}

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    for (let i = 0; i < circlesArray.length; i++) {
        if (circlesArray[i].isPointInside(x, y)) {
            circlesArray.splice(i, 1);
            circlesDestroyed++;
            score++;
            updateHighScore();
            updateScoreDisplay();
            if (circlesDestroyed % 10 === 0) {
                level++;
                document.getElementById('level-display').textContent = "Nivel: " + level;
                increaseCircleSpeed();
            }
            createCircle();
            break;
        }
    }
});

function updateScoreDisplay() {
    document.getElementById('score-display').textContent = "Puntaje: " + score;
}

function updateLivesDisplay() {
    document.getElementById('lives-display').textContent = lives;
}

updateScoreDisplay();
updateLivesDisplay();

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < circlesArray.length; i++) {
        circlesArray[i].update(ctx);
        if (circlesArray[i].shouldBeRemoved) {
            circlesArray.splice(i, 1);
            i--;
        }
    }
    if (circlesArray.length < 10) {
        createCircle();
    }
    requestAnimationFrame(animate);
}

for (let i = 0; i < 10; i++) {
    createCircle();
}

animate();
