// import { randomIntFromRange, randomColor, distance } from './utils.js';
/** @type {HTMLCanvasElement} */

/** @type {CanvasRenderingContext2D} */

const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

const mouse = {
  x: innerWidth / 2,
  y: innerHeight / 2,
};

const colors = ['#2185C5', '#7ECEFD', '#FFF6E5', '#FF7F66'];

// Event Listeners
addEventListener('mousemove', (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});

addEventListener('resize', () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;

  init();
});

const ENVIRONMENTS = {
  earth: { gravity: 0.5, friction: 0.99, elasticity: 0.7, color: '#2185C5' },
  moon: { gravity: 0.08, friction: 0.95, elasticity: 0.8, color: '#999' },
  mars: { gravity: 0.38, friction: 0.97, elasticity: 0.6, color: '#FF7F66' },
  jupiter: { gravity: 1.3, friction: 0.98, elasticity: 0.65, color: '#E27B58' },
  space: { gravity: 0, friction: 0.999, elasticity: 0.9, color: '#7ECEFD' },
};

const ball = {
  x: innerWidth / 2,
  y: innerHeight / 2,
  radius: 30,
  dx: 5, // kecepatan horizontal
  dy: 0, // kecepatan vertikal
  gravity: 0.5, // percepatan gravitasi
  friction: 0.99, // gesekan (0-1)
  elasticity: 0.7, // elastisitas pantulan (0-1)
};

let envChange = 'earth';

// Objects
class Object {
  constructor(
    x = innerWidth / 2,
    y = innerHeight / 2,
    radius = 30,
    dx = (Math.random() - 0.5) * 5,
    dy = 0,
    environment = envChange
  ) {
    const env = ENVIRONMENTS[environment];

    this.x = x;
    this.y = y;
    this.radius = radius;
    this.dx = dx;
    this.dy = dy;
    this.gravity = env.gravity;
    this.friction = env.friction;
    this.elasticity = env.elasticity;
    this.color = env.color;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.closePath();

    c.beginPath();
    c.ellipse(
      this.x,
      canvas.height - 5,
      this.radius * 0.8,
      this.radius * 0.2,
      0,
      0,
      Math.PI * 2
    );
    c.fillStyle = 'rgba(0,0,0,0.2)';
    c.fill();
  }

  update() {
    // Terapkan gravitasi
    this.dy += this.gravity;

    // Terapkan gesekan
    this.dx *= this.friction;
    this.dy *= this.friction;

    // Update posisi
    this.x += this.dx;
    this.y += this.dy;

    // Deteksi tumbukan dengan dinding
    // Kanan
    if (this.x + this.radius > canvas.width) {
      this.x = canvas.width - this.radius;
      this.dx = -this.dx * this.elasticity;
    }
    // Kiri
    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.dx = -this.dx * this.elasticity;
    }
    // Bawah (lantai)
    if (this.y + this.radius > canvas.height) {
      this.y = canvas.height - this.radius;
      this.dy = -this.dy * this.elasticity;

      // Hentikan bola jika kecepatannya sangat kecil
      if (Math.abs(this.dy) < 0.5) this.dy = 0;
    }
    // Atap (opsional)
    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.dy = -this.dy * this.elasticity;
    }
    this.draw();
  }

  changeEnvironment(env) {
    const newEnv = ENVIRONMENTS[env];
    this.gravity = newEnv.gravity;
    this.friction = newEnv.friction;
    this.elasticity = newEnv.elasticity;
    this.color = newEnv.color;
    this.environment = env;
  }
}

// Implementation
let objects;
function init() {
  objects = [];

  for (let i = 0; i < 1; i++) {
    objects.push(new Object());
  }
}

canvas.addEventListener('click', (e) => {
  objects.push(new Object(e.clientX, e.clientY));
});

document.querySelectorAll('button').forEach((button) => {
  button.addEventListener('click', () => {
    const env = button.textContent;
    envChange = env.toLocaleLowerCase();
  });
});

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, canvas.width, canvas.height);

  objects.forEach((object) => {
    object.update();
  });
}

init();
animate();
