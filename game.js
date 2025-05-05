const wFull = window.innerWidth;
const hFull = window.innerHeight;
const velocity = 5000;
const ballR = 25;

let player;
let cursors;
let jumpCount = 0;
let isHoldingJump = false;
let jumpHoldTimer = 0;
const MAX_HOLD_TIME = 150; // ms
const JUMP_FORCE = -400;

const config = {
  type: Phaser.AUTO,
  width: wFull,
  height: hFull,
  backgroundColor: 'rgb(255, 255 ,255, 1)',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: velocity },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);

function preload() {
  // no asset
}

function create() {
  //dirt
  // const ground = this.add.rectangle(
  //   0,
  //   hFull,
  //   window.innerWidth * 2,
  //   hFull * 0.1,
  //   0x9b7653
  // );
  // this.physics.add.existing(ground, true);

  // Ground and platforms
  const groundGroup = this.physics.add.staticGroup();

  const platformWidth = 150;
  const platformHeight = [hFull * 0.1, hFull * 0.15, hFull * 0.18, hFull * 0.2];
  const gap = [10, 15, 20];
  const totalPlatforms = 10;
  let xPos = 0;

  for (let i = 0; i < totalPlatforms; i++) {
    // create dirt when odd numbers
    if (i % 2 === 0) {
      const platform = this.add
        .rectangle(
          xPos,
          hFull,
          platformWidth,
          platformHeight[Math.floor(Math.random() * platformHeight.length)],
          0x9b7653
        )
        .setOrigin(0, 1); // from the lower left corner

      groundGroup.add(platform);
      this.physics.add.existing(platform, true);
    }

    xPos += platformWidth + gap[Math.floor(Math.random() * gap.length)];
  }

  // Create player (ball)
  player = this.add.circle(0 + ballR, hFull - hFull * 0.25, ballR, 0xff0000);
  this.physics.add.existing(player);

  // Physics interactions
  // player.body.setCollideWorldBounds(true);
  this.physics.add.collider(player, groundGroup);
  player.body.setBounce(0.2);
  player.body.setGravityY(velocity);
  player.body.setDragX(300);

  cursors = this.input.keyboard.createCursorKeys(); // ← ↑ → ↓
  this.cameras.main.startFollow(player); // Camera Following the Player
  this.cameras.main.setBounds(0, 0, xPos + ballR + wFull, hFull); // camera scroll limit
}

function update(time, delta) {
  const playerB = player.body;
  const speed = 200;
  const jumpVelocity = -velocity;
  const HOLD_BOOST = 30;

  playerB.setVelocity(0);

  if (cursors.left.isDown) {
    playerB.setVelocityX(-speed);
  } else if (cursors.right.isDown) {
    playerB.setVelocityX(speed);
  }

  //reset if touch dirt
  if (playerB.blocked.down) {
    jumpCount = 0;
    isJumping = false;
    jumpHoldTimer = 0;
  }

  if (Phaser.Input.Keyboard.JustDown(cursors.up) && jumpCount < 2) {
    playerB.setVelocityY(jumpVelocity);
    isHoldingJump = true;
    jumpHoldTimer = 0;
    jumpCount++;
  }

  if (isHoldingJump && cursors.up.isDown && jumpHoldTimer < MAX_HOLD_TIME) {
    playerB.velocity.y -= HOLD_BOOST * (delta / 16.67); // more smooth
    jumpHoldTimer += delta;
  }
  if (Phaser.Input.Keyboard.JustUp(cursors.up)) {
    isHoldingJump = false;
  }

  // Auto-scrolling the world by moving the platforms
  if (playerB.x > wFull / 2) {
    this.cameras.main.setScroll(player.x - wFull / 2, 0);
  }

  // Dead check and respawn, radiusball = 25
  if (player.y >= hFull - ballR - 10) {
    player.setPosition(0 + ballR, hFull - hFull * 0.25);
  }
}
