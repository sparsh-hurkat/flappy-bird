import Phaser from 'phaser';
import { GameEvents } from '../types';

// Helper to get base URL for assets
function getBaseUrl(): string {
  const pathname = window.location.pathname;
  if (pathname.startsWith('/flappy-bird')) {
    return '/flappy-bird/';
  }
  return '/';
}

export class MainScene extends Phaser.Scene {
  declare add: Phaser.GameObjects.GameObjectFactory;
  declare sys: Phaser.Scenes.Systems;
  declare physics: Phaser.Physics.Arcade.ArcadePhysics;
  declare input: Phaser.Input.InputPlugin;
  declare time: Phaser.Time.Clock;
  declare tweens: Phaser.Tweens.TweenManager;
  declare game: Phaser.Game;
  declare make: Phaser.GameObjects.GameObjectCreator;
  declare scene: Phaser.Scenes.ScenePlugin;
  declare load: Phaser.Loader.LoaderPlugin;
  declare textures: Phaser.Textures.TextureManager;

  private bird!: Phaser.Physics.Arcade.Sprite;
  private pipes!: Phaser.Physics.Arcade.Group;
  private logos!: Phaser.Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private score: number = 0;
  private isGameRunning: boolean = false;
  private pipeTimer!: Phaser.Time.TimerEvent;
  private logoTimer!: Phaser.Time.TimerEvent;
  private unlockedCount: number = 0;

  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    const baseUrl = getBaseUrl();
    this.load.image('pipe-body', `${baseUrl}assets/pipe-body.png`);
    this.load.image('pipe-cap', `${baseUrl}assets/pipe-cap.png`);
    this.load.image('bird', `${baseUrl}assets/bird.png`);
    this.load.image('logo', `${baseUrl}assets/logo.png`);
    // this.load.image('background', `${baseUrl}assets/background.png`);
  }

  create() {
    if (!this.textures.exists('background')) this.createBackgroundTexture();

    const bg = this.add.image(0, 0, 'background').setOrigin(0, 0);
    bg.displayWidth = this.sys.canvas.width;
    bg.displayHeight = this.sys.canvas.height;

    this.bird = this.physics.add.sprite(100, 300, 'bird');
    this.bird.setCollideWorldBounds(true);
    this.bird.setGravityY(1000);

    this.pipes = this.physics.add.group();
    this.logos = this.physics.add.group();

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.input.keyboard.on('keydown-SPACE', this.jump, this);
    }
    this.input.on('pointerdown', this.jump, this);

    this.physics.add.collider(this.bird, this.pipes, this.hitPipe, undefined, this);
    this.physics.add.overlap(this.bird, this.logos, this.collectLogo, undefined, this);

    this.score = 0;
    this.isGameRunning = true;

    this.pipeTimer = this.time.addEvent({
      delay: 1500,
      callback: this.addRowOfPipes,
      callbackScope: this,
      loop: true,
    });

    this.logoTimer = this.time.addEvent({
      delay: 5000 + Math.random() * 3000, // Random spawns between 5-8s
      callback: this.spawnLogo,
      callbackScope: this,
      loop: true,
    });
  }

  update() {
    if (!this.isGameRunning) return;

    if (this.bird.body && this.bird.body.velocity.y < 0) {
      this.tweens.add({
        targets: this.bird,
        angle: -20,
        duration: 100,
        ease: 'Power1'
      });
    } else if (this.bird.body && this.bird.body.velocity.y > 0) {
      this.tweens.add({
        targets: this.bird,
        angle: 20,
        duration: 100,
        ease: 'Power1'
      });
    }

    if (this.bird.y > Number(this.sys.canvas.height) - 20 || this.bird.y < 0) {
      this.hitPipe();
    }

    this.pipes.getChildren().forEach((pipe: any) => {
      if (pipe.x < -50) pipe.destroy();
    });
    this.logos.getChildren().forEach((logo: any) => {
      if (logo.x < -50) logo.destroy();
    });
  }

  jump() {
    if (!this.isGameRunning) {
      return;
    }
    this.bird.setVelocityY(-350);
  }

  addRowOfPipes() {
    if (!this.isGameRunning) return;

    const canvasHeight = this.sys.canvas.height;
    const pipeSegmentHeight = 60;
    const holeHeight = 3;

    const totalSegments = Math.ceil(canvasHeight / pipeSegmentHeight);

    const minHole = 1;
    const maxHole = totalSegments - holeHeight - 1;
    const hole = Math.floor(Math.random() * (maxHole - minHole + 1)) + minHole;

    for (let i = 0; i < totalSegments; i++) {
      if (i !== hole && i !== hole + 1 && i !== hole + 2) {

        let texture = 'pipe-body';
        let offsetX = 0;
        const isBottomPipe = i > hole + 2;
        let isCap = false;

        if (i === hole - 1) {
          texture = 'pipe-cap';
          offsetX = 0;
          isCap = true;
        }

        else if (i === hole + 3) {
          texture = 'pipe-cap';
          offsetX = 0;
          isCap = true;
        }

        this.addOnePipe(this.sys.canvas.width + offsetX, i * pipeSegmentHeight + pipeSegmentHeight / 2, texture, isBottomPipe, isCap);
      }
    }

    this.score += 1;
    this.game.events.emit(GameEvents.SCORE_UPDATE, this.score);
  }

  addOnePipe(x: number, y: number, texture: string, flipVertical: boolean = false, isCap: boolean = false) {
    const pipe = this.pipes.create(x, y, texture);
    pipe.setVelocityX(-200);
    pipe.setImmovable(true);
    pipe.body.allowGravity = false;
    if (flipVertical) {
      pipe.setFlipY(true);
    }
    if (isCap && flipVertical) {
      pipe.setDepth(y + 1000);
    }
  }

  spawnLogo() {
    if (!this.isGameRunning) return;

    const height = this.sys.canvas.height;
    const y = Phaser.Math.Between(100, height - 100);

    const logo = this.logos.create(this.sys.canvas.width, y, 'logo');
    logo.setVelocityX(-250);
    logo.setImmovable(true);
    logo.body.allowGravity = false;

    this.tweens.add({
      targets: logo,
      y: y + 30,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
  }

  collectLogo(bird: any, logo: any) {
    logo.destroy();
    if (this.unlockedCount >= 3) {
      this.score += 10;
      this.game.events.emit(GameEvents.SCORE_UPDATE, this.score);
    } else {
      this.pauseGame();
      this.game.events.emit(GameEvents.UNLOCK_ANSWER);
    }
  }

  hitPipe() {
    this.physics.pause();
    this.isGameRunning = false;
    this.bird.setTint(0xff0000);
    this.game.events.emit(GameEvents.GAME_OVER);
  }

  pauseGame() {
    this.physics.pause();
    this.isGameRunning = false;
    if (this.pipeTimer) this.pipeTimer.paused = true;
    if (this.logoTimer) this.logoTimer.paused = true;
  }

  public resumeGame() {
    this.physics.resume();
    this.isGameRunning = true;
    if (this.pipeTimer) this.pipeTimer.paused = false;
    if (this.logoTimer) this.logoTimer.paused = false;
    this.bird.setVelocityY(-200);
  }

  public restartGame() {
    this.scene.restart();
  }

  public setUnlockedCount(count: number) {
    this.unlockedCount = count;
  }

  createLogoTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0xffffff); // White bg
    graphics.fillCircle(25, 25, 25);
    graphics.fillStyle(0x2563eb);
    graphics.fillCircle(25, 25, 20);
    graphics.fillStyle(0xffffff); // Inner hole
    graphics.fillCircle(25, 25, 10);
    graphics.generateTexture('logo', 50, 50);
    graphics.destroy();
  }

  createBackgroundTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    const width = this.sys.canvas.width;
    const height = this.sys.canvas.height;
    graphics.fillStyle(0x93c5fd); // Light Blue Sky
    graphics.fillRect(0, 0, width, height);
    graphics.generateTexture('background', width, height);
    graphics.destroy();
  }
}