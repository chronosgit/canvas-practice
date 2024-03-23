/* Setup */
const canvas = document.getElementById("particle_system");
const ctx = canvas.getContext("2d"); // WebGL or 2D
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


/* Resize handler */
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});


/* Actual practice code */
const mouse = {
    x: undefined, y: undefined,
};
const particles = [];
const colors = [
    "red", "yellow", "black", "magenta", "lime", "green", 
    "white", "gray", "orange", "purple", "grey", "brown",
];

class Particle {

    constructor() {
        const randomColorId = Math.round(Math.random() * colors.length);
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.color = colors[randomColorId];
        this.size = Math.random() * 10 + 1; // 1 to 6
        this.speedX = Math.random() * 3 - 1.5; // -1.5 to 1.5
        this.speedY = Math.random() * 3 - 1.5; // -1.5 to 1.5
    }

    update() {
        // Overflow conditions
        const isOverflowXLeft = Boolean(this.x + this.speedX < 0);
        const isOverflowYUp = Boolean(this.y + this.speedY < 0);
        const isOverflowXRight = Boolean(this.x + this.speedX > canvas.width);
        const isOverflowYBottom = Boolean(this.y + this.speedY > canvas.height);

        if(isOverflowXLeft || isOverflowXRight) {
            this.speedX *= -1;
        }
        if(isOverflowYBottom || isOverflowYUp) {
            this.speedY *= -1;
        }

        this.x += this.speedX;
        this.y += this.speedY;
    }

    draw() {
        ctx.fillStyle = this.color;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Spawn N particles
function spawnParticles() {
    const N = 250;

    for(let i = 0; i < N; i++) {
        const p = new Particle();
        particles.push(p);
    }
}
spawnParticles();

// Handle updating particles on random trajectories
function updateParticles() {
    for(let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
    }
}


/* Infinite action performer */
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height) // fromX, fromY, toX, toY
    updateParticles();
    requestAnimationFrame(animate); // Calls passed func once
}
animate();