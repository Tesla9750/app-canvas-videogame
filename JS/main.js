const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
const gameOverButton = document.getElementById("game-over-button");
const victoryButton = document.getElementById("victory-button");
const phaseMessage = document.getElementById("phase-message");

// Cargar las imágenes de fondo para cada fase
const backgroundImages = [
    'assets/backgrounds/constelation-background.jpeg',
    'assets/backgrounds/galaxy-background.jpeg',
    'assets/backgrounds/sky-background.jpg',
    'assets/backgrounds/river-background.jpeg',
    'assets/backgrounds/valley-background.jpeg',
    'assets/backgrounds/house-background.jpeg'
];
let currentBackgroundIndex = 0;
let backgroundImage = new Image();
backgroundImage.src = backgroundImages[currentBackgroundIndex];

backgroundImage.onload = function() {
    animate();
}

// Cargar la música de fondo
const backgroundMusic = new Audio('assets/sounds/cantina-background-band.mp3');
backgroundMusic.loop = true;

function playBackgroundMusic() {
    backgroundMusic.play().catch((error) => {
        console.log('No se pudo reproducir la música de fondo: ' + error);
    });
}

function resizeCanvas() {
    const canvasContainer = document.getElementById("canvas-container");
    canvas.width = canvasContainer.clientWidth;
    canvas.height = canvasContainer.clientHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let score = 0;
let highScore = getCookie("highScore") || 0;
highScore = parseInt(highScore);
let lives = 10;
let level = 1;
let circlesArray = [];
let circlesDestroyed = 0;

const clickSound = new Audio('assets/sounds/shoot-sound-2.mp3');
const lifeLostSound = new Audio('assets/sounds/destroy-sound.mp3');

function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    document.cookie = name + '=; Max-Age=-99999999;';
}

function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        setCookie("highScore", highScore, 365);
        document.getElementById("highscore-display").textContent = highScore;
    }
}

document.getElementById("highscore-display").textContent = highScore;

const imageUrls = [
    'assets/enemys/enemy_1.png',
    'assets/enemys/enemy_2.png',
    'assets/enemys/enemy_3.png',
    'assets/enemys/enemy_4.png',
    'assets/enemys/enemy_5.png'
];

class Circle {
    constructor(x, y, radius, imageUrl, speed) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.image = new Image();
        this.image.src = imageUrl;
        this.speed = speed;
        this.dx = 0;
        this.dy = -1 * this.speed;
        this.shouldBeRemoved = false;
    }

    draw(context) {
        context.drawImage(this.image, this.posX - this.radius, this.posY - this.radius, this.radius * 2, this.radius * 2);
    }

    update(context) {
        this.draw(context);
        if (this.posY - this.radius <= 0) {
            this.shouldBeRemoved = true;
            lives--;
            lifeLostSound.play();
            updateLivesDisplay();
            if (lives <= 0) {
                endGame();
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

function createCircle() {
    let circleCreated = false;
    while (!circleCreated) {
        let randomRadius = Math.floor(Math.random() * 30 + 35);
        let randomX = Math.random() * (canvas.width - 2 * randomRadius) + randomRadius;
        let randomY = canvas.height + randomRadius;
        let randomSpeed = Math.random() * 0.8 + 0.3;
        let randomImage = imageUrls[Math.floor(Math.random() * imageUrls.length)];
        let creationValid = true;
        for (let j = 0; j < circlesArray.length; j++) {
            let distance = getDistance(randomX, randomY, circlesArray[j].posX, circlesArray[j].posY);
            if (distance < randomRadius + circlesArray[j].radius) {
                creationValid = false;
                break;
            }
        }
        if (creationValid) {
            circlesArray.push(new Circle(randomX, randomY, randomRadius, randomImage, randomSpeed));
            circleCreated = true;
        }
    }
}

function increaseCircleSpeed() {
    for (let i = 0; i < circlesArray.length; i++) {
        circlesArray[i].speed += 0.6;
        circlesArray[i].dy = -0.2 * circlesArray[i].speed;
    }
}

canvas.addEventListener('click', (event) => {
    playBackgroundMusic();
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    for (let i = 0; i < circlesArray.length; i++) {
        if (circlesArray[i].isPointInside(x, y)) {
            clickSound.play();
            circlesArray.splice(i, 1);
            circlesDestroyed++;
            score++;
            updateHighScore();
            updateScoreDisplay();
            if (circlesDestroyed % 10 === 0) {
                level++;
                document.getElementById('level-display').textContent = level;
                increaseCircleSpeed();
                if (level % 3 === 0) {
                    changePhase(level / 3);
                }
                if (level === 18) {
                    victory();
                }
            }
            createCircle();
            break;
        }
    }
});

function updateScoreDisplay() {
    document.getElementById('score-display').textContent = "Puntaje " + score;
}

function updateLivesDisplay() {
    document.getElementById('lives-display').textContent = "Vidas : " + lives;
}

updateScoreDisplay();
updateLivesDisplay();

function changePhase(phase) {
    const phaseMessages = [
        "Fase 1 - Invasión Planetaria. Prepárate para defender tu planeta.",
        "Fase 2 - Pelea en el Cielo. Enfrenta a los invasores para evitar que lleguen a tu ciudad.",
        "Fase 3 - Valle Central. El último bastión de defensa.",
        "Fase 4 - Los cubos. ¿Será este el fin?",
        "Fase 5 - El fin.",
        "Fase 6 - Victoria."
    ];

    currentBackgroundIndex = (currentBackgroundIndex + 1) % backgroundImages.length;
    backgroundImage.src = backgroundImages[currentBackgroundIndex];
    phaseMessage.style.display = 'block';
    phaseMessage.textContent = phaseMessages[phase - 1]; // Mostrar el mensaje de fase con más texto
    setTimeout(() => {
        phaseMessage.style.display = 'none';
    }, 3000);
}

let gameState = "playing"; // Variable para manejar el estado del juego

function victory() {
    gameState = "victory";
    backgroundMusic.pause();
    canvas.style.cursor = "default";
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar la pantalla
    ctx.fillStyle = 'black'; // Establecer color de fondo negro
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Dibujar fondo negro
    victoryButton.style.display = "block";
    victoryButton.addEventListener('click', () => {
        location.reload();
    });
}

function animate() {
    if (gameState === "playing") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

        for (let i = 0; i < circlesArray.length; i++) {
            circlesArray[i].update(ctx);
            if (circlesArray[i].shouldBeRemoved) {
                circlesArray.splice(i, 1);
                i--;
            }
        }
        if (circlesArray.length < 1 + level * 0.6) {
            createCircle();
        }
        requestAnimationFrame(animate);
    } else if (gameState === "victory") {
        // Detener el juego en el estado de victoria
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        circlesArray = [];  // Vaciar el array de círculos
        
    }
}

function endGame() {
    gameState = "gameOver";
    backgroundMusic.pause();
    canvas.style.cursor = "default";
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar la pantalla
    ctx.fillStyle = 'black'; // Establecer color de fondo negro
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Dibujar fondo negro
    gameOverButton.style.display = "block";
    gameOverButton.addEventListener('click', () => {
        location.reload();
    });
}

canvas.style.cursor = "url(assets/mouse-icon.png), auto";

animate();
