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
    this.draw();
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
