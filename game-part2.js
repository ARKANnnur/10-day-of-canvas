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

//ground
let lastPlatformX = 0;
let groundGroup;
const platformWidth = [50, 100, 150];
const platformHeight = [hFull * 0.1, hFull * 0.15, hFull * 0.18, hFull * 0.2];
const platformFlyWidth = [100, 150, 180];
const platformFlyHeight = [15, 20, 25];
const platformFlyY = [hFull * 0.6, hFull * 0.7, hFull * 0.8];
const gap = 10;
const totalPlatforms = 10;
let xPos = 0;

function preload() {
  // no asset
}

function createPlatform(scene, x, y, width, height, color = 0x9b7653) {
  const platform = scene.add
    .rectangle(x, y, width, height, color)
    .setOrigin(0, 1);
  groundGroup.add(platform);
  scene.physics.add.existing(platform, true);
  return platform;
}

function generateInitialPlatforms(scene) {
  for (let i = 0; i < totalPlatforms; i++) {
    const width = Phaser.Math.RND.pick(platformWidth);
    const height =
      i === totalPlatforms.length - 1 || totalPlatforms[i + 1] % 2 !== 0
        ? hFull * 0.3
        : Phaser.Math.RND.pick(platformHeight);
    if (i % 2 === 0) {
      createPlatform(scene, xPos, hFull, width, height);
    }
    xPos += width + gap;
    lastPlatformX = xPos;
  }
}

let lastGapY = hFull * 0.6;
let movingGates = [];

function createGateObstacle(scene, x, baseGapY = hFull * 0.6) {
  const gapHeight = Phaser.Math.Between(100, 150);
  const gateWidth = 50;

  const gapY = Phaser.Math.Clamp(
    baseGapY + Phaser.Math.Between(-100, 100),
    hFull * 0.3,
    hFull * 0.6
  );

  const top = scene.add
    .rectangle(x, gapY - gapHeight / 2, gateWidth, hFull, 0x6cf)
    .setOrigin(0, 1);
  const bottom = scene.add
    .rectangle(x, gapY + gapHeight / 2, gateWidth, hFull, 0x6cf)
    .setOrigin(0, 0);

  groundGroup.add(top);
  groundGroup.add(bottom);
  scene.physics.add.existing(top, true);
  scene.physics.add.existing(bottom, true);

  const moveDistance = 100;
  scene.tweens.add({
    targets: [top, bottom],
    y: `+=${moveDistance}`,
    duration: 2000,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });
  movingGates.push({ top, bottom });

  return gapY; // Return to be a reference for further validation
}

let movingPlatform = [];

function createMovingPlatform(
  scene,
  x,
  y,
  width,
  height,
  range = 100,
  speed = 2000
) {
  const platform = scene.add
    .rectangle(x, y, width, height, 0x3399ff)
    .setOrigin(0, 1);
  groundGroup.add(platform);
  scene.physics.add.existing(platform, true);

  scene.tweens.add({
    targets: platform,
    x: `+=${range}`,
    duration: speed,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });

  movingPlatform.push(platform);

  return platform;
}

let enemyGroup;
function createEnemy(scene, x, y, range = 80, speed = 1000) {
  const enemy = scene.add.rectangle(x, y, 30, 30, 0xff00ff);
  enemyGroup.add(enemy);
  scene.physics.add.existing(enemy);
  enemy.body.setAllowGravity(false);
  enemy.body.setImmovable(true);

  scene.tweens.add({
    targets: enemy,
    x: `+=${range}`,
    duration: speed,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });

  return enemy;
}

function createStarEnemy(scene, x, y, speed = 10000, freze = false) {
  const camera = scene.cameras.main;
  const xStart = !freze ? camera.scrollX + camera.width + 50 : x;
  const star = scene.add.star(xStart, y, 5, 10, 20, 0xffff00); // 5-point star
  enemyGroup.add(star);

  scene.physics.add.existing(star);
  star.body.setAllowGravity(false);
  star.body.setImmovable(true);

  if (!freze) {
    scene.tweens.add({
      targets: star,
      x: -50,
      duration: speed,
      ease: 'Linear',
      onComplete: () => {
        star.destroy(); // delete from scene
        enemyGroup.remove(star); // delete from grup
      },
    });
  }

  return star;
}

function create() {
  // Ground and platforms
  groundGroup = this.physics.add.staticGroup();
  generateInitialPlatforms(this);

  enemyGroup = this.physics.add.group();

  // Create player (ball)
  player = this.add.circle(0 + ballR, hFull - hFull * 0.35, ballR, 0xff0000);
  this.physics.add.existing(player);

  // Physics interactions
  // player.body.setCollideWorldBounds(true);
  this.physics.add.collider(player, groundGroup);
  player.body.setBounce(0.2);
  player.body.setGravityY(velocity);
  player.body.setDragX(300);

  cursors = this.input.keyboard.createCursorKeys(); // ← ↑ → ↓
  this.cameras.main.startFollow(player); // Camera Following the Player
  this.cameras.main.setBounds(0, 0, Number.MAX_SAFE_INTEGER, hFull); // camera scroll limit

  // long progress
  this.distanceText = this.add
    .text(20, 20, 'Journey: 0', {
      fontSize: '24px',
      fill: '#000',
    })
    .setScrollFactor(0);

  this.physics.add.collider(player, enemyGroup, (_, enemyObj) => {
    player.setAlpha(0.5);
    this.time.delayedCall(200, () => {
      player.setAlpha(1);
      player.setPosition(ballR, hFull - hFull * 0.35);
    });
  });
}

let maxDistance = 0;

function update(time, delta) {
  const playerB = player.body;
  const speed = 200;
  const jumpVelocity = -velocity;
  const HOLD_BOOST = 30;

  const threshold = wFull * 0.7;
  // const margin = wFull * 1.5; // Platform behind the player as far as 1.5x the screen will be deleted

  const distanceTravelled = Math.floor(player.x);
  maxDistance = Math.max(maxDistance, distanceTravelled);
  this.distanceText.setText(
    `Journey: ${distanceTravelled - ballR} (Top Journey: ${
      maxDistance - ballR
    })`
  );

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
    player.setPosition(0 + ballR, hFull - hFull * 0.35);
  }

  // collider for gate work
  movingGates.forEach((gate) => {
    gate.top.body.updateFromGameObject(); // Update physics body top gate
    gate.bottom.body.updateFromGameObject(); // Update physics body bottom gate
  });
  movingPlatform.forEach((platform) => {
    platform.body.updateFromGameObject();
  });

  if (player.x + threshold > lastPlatformX) {
    for (let i = 0; i < 3; i++) {
      const rand = Phaser.Math.Between(0, 2);

      if (rand === 0) {
        // Gate obstacle dengan validasi tinggi
        lastGapY = createGateObstacle(this, lastPlatformX, lastGapY);
        lastPlatformX += 200;
      } else {
        const y = i === 3 ? hFull * 0.5 : Phaser.Math.RND.pick(platformFlyY);
        const width = Phaser.Math.RND.pick(platformFlyWidth);
        const height = Phaser.Math.RND.pick(platformFlyHeight);
        if (i == 2)
          createMovingPlatform(this, lastPlatformX, hFull * 0.8, 100, 20);
        else {
          // add enemy
          if (Phaser.Math.Between(0, 1)) {
            const range = width - 30; // platform width - enemy width
            const enemyX = lastPlatformX + 15; // start from left edge
            const enemyY = y - height - 30;
            createEnemy(this, enemyX, enemyY, range);
          }
          if (Phaser.Math.Between(0, 1)) {
            const enemyX = wFull;
            const enemyY = y - height - 50;
            createStarEnemy(this, enemyX, enemyY);
          }

          createPlatform(this, lastPlatformX, y, width, height, 0x9b3);
        }

        lastPlatformX += width + gap * 10;
      }
    }
  }

  // groundGroup.getChildren().forEach((platform) => {
  //   const platformRight = platform.x + platform.width;

  //   if (platformRight < player.x - margin) {
  //     platform.destroy(); // delete from scene & physics
  //     groundGroup.remove(platform); // delete from group
  //   }
  // });
}
