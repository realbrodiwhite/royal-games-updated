import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';

class PrizeWheel {
  private stage: PIXI.Container;
  private wheel: PIXI.Sprite;
  private pointer: PIXI.Sprite;
  private prizes: string[];
  private spinning: boolean;

  constructor(stage: PIXI.Container, prizes: string[]) {
    this.stage = stage;
    this.prizes = prizes;
    this.spinning = false;

    this.wheel = PIXI.Sprite.from('wheel.png');
    this.pointer = PIXI.Sprite.from('pointer.png');

    this.wheel.anchor.set(0.5);
    this.pointer.anchor.set(0.5);

    this.wheel.x = stage.width / 2;
    this.wheel.y = stage.height / 2;
    this.pointer.x = stage.width / 2;
    this.pointer.y = stage.height / 2 - this.wheel.height / 2 - 20;

    stage.addChild(this.wheel);
    stage.addChild(this.pointer);
  }

  spin() {
    if (this.spinning) return;

    this.spinning = true;
    const rotation = Math.random() * 360 + 360 * 5; // Spin at least 5 times
    gsap.to(this.wheel, {
      rotation: rotation * (Math.PI / 180),
      duration: 5,
      ease: 'power4.out',
      onComplete: () => {
        this.spinning = false;
        const prizeIndex = Math.floor((rotation % 360) / (360 / this.prizes.length));
        alert(`You won: ${this.prizes[prizeIndex]}!`);
      },
    });
  }
}

export default PrizeWheel;
