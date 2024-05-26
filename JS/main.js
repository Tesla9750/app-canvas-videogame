const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
const gameOverButton = document.getElementById("game-over-button");

// Cargar la imagen de fondo
const backgroundImage = new Image();
backgroundImage.src = 'assets/backgrounds/space-background.png';  // Asegúrate de que esta ruta sea correcta

backgroundImage.onload = function() {
    animate();  // Iniciar la animación una vez que la imagen de fondo se haya cargado
}

// Cargar la música de fondo
const backgroundMusic = new Audio('assets/sounds/cantina-background-band.mp3'); // Asegúrate de que esta ruta sea correcta
backgroundMusic.loop = true; // Hacer que la música se reproduzca en bucle

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

// Cargar los sonidos
const clickSound = new Audio('assets/sounds/shoot-sound.mp3'); // Asegúrate de que esta ruta sea correcta
const lifeLostSound = new Audio('assets/sounds/destroy-sound.mp3'); // Asegúrate de que esta ruta sea correcta

// Funciones para manejar cookies
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
        setCookie("highScore", highScore, 365);  // Guardar el highscore en una cookie por 1 año
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
            lifeLostSound.play(); // Reproducir sonido de perder vida
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
        let randomRadius = Math.floor(Math.random() * 25 + 35);
        let randomX = Math.random() * (canvas.width - 2 * randomRadius) + randomRadius;
        let randomY = canvas.height + randomRadius;
        let randomSpeed = Math.random() * 2 + 0.5;  // Reducir la velocidad inicial
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
        circlesArray[i].speed += 0.2; // Incrementar la velocidad en 0.2
        circlesArray[i].dy = -1 * circlesArray[i].speed;
    }
}

canvas.addEventListener('click', (event) => {
    playBackgroundMusic(); // Iniciar la música de fondo al primer clic
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    for (let i = 0; i < circlesArray.length; i++) {
        if (circlesArray[i].isPointInside(x, y)) {
            clickSound.play(); // Reproducir sonido de click
            circlesArray.splice(i, 1);
            circlesDestroyed++;
            score++;
            updateHighScore();
            updateScoreDisplay();
            if (circlesDestroyed % 10 === 0) {
                level++;
                document.getElementById('level-display').textContent =  level;
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
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);  // Dibujar la imagen de fondo

    for (let i = 0; i < circlesArray.length; i++) {
        circlesArray[i].update(ctx);
        if (circlesArray[i].shouldBeRemoved) {
            circlesArray.splice(i, 1);
            i--;
        }
    }
    if (circlesArray.length < 10 + level * 5) {
        createCircle();
    }
    requestAnimationFrame(animate);
}

function endGame() {
    backgroundMusic.pause(); // Pausar la música de fondo
    canvas.style.cursor = "default";
    gameOverButton.style.display = "block";
    gameOverButton.addEventListener('click', () => {
        location.reload();  // Recargar la página para reiniciar el juego
    });
}

// Ocultar el cursor sobre el canvas
animate();
