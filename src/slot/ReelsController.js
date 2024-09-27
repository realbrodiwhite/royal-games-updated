// File path: /royalgames-main/src/features/slot/ReelsController.js

import Reel from './Reel';

class ReelsController {
  // Arrays to store callback functions
  onStartFns = [];
  onStopCommandFns = [];
  onStopFns = [];
  stopCommandGiven = false;

  constructor(game, spinTime, spinTimeBetweenReels) {
    this.reels = [];

    // Create reels based on game configuration
    for (let i = 0; i < game.reelsCount; i++) {
      // Generate random spin values for each reel
      const spinValues = [];
      for (let k = 0; k < 1000; k++) {
        spinValues.push(parseInt(Math.random() * game.symbolsCount) + 1);
      }
  
      // Create a new Reel instance
      const reel = new Reel({
        positions: game.reelPositions,
        spinValues,
        speed: game.reelsSpeed,
        useBlurredSymbols: game.hasBlurredSymbols,
        bounceDepthPerc: 0.1,
        bounceDuration: 350,
        symbolMargin: game.symbolMargin,
        maskPaddingX: game.maskPaddingX,
        maskPaddingY: game.maskPaddingY,
      });
      reel.container.z = 3;
      reel.mask.z = 4;

      // Add reel rendering to game ticker
      game.ticker.add(() => {
        reel.render();
      });

      // Add reel container and mask to game stage
      game.stage.addChild(reel.container);
      game.stage.addChild(reel.mask);
      this.reels.push(reel);
    }
  
    // Initialize rolling time for each reel
    this.reels.forEach((reel) => {
      reel.rollingTime = 0;
    });

    // Set spin timing parameters
    this.spinTime = spinTime || 350;
    this.spinTimeBetweenReels = spinTimeBetweenReels || 200;
  
    // Add reel stopping logic to game ticker
    game.ticker.add((delta) => {
      for (let i = 0; i < this.reels.length; i++) {
        const reel = this.reels[i];
        const active = reel.rolling === true || reel.stopping !== false;
  
        if (active && game.betResponse) {
          const reelStopTime = this.spinTime + (i * this.spinTimeBetweenReels);
          if (reel.rollingTime > reelStopTime) {
            reel._stopValues = reel.stopValues;
            reel.stop();
            reel.onceStop(function() {
              reel.stoppedAutomatically = true;
            });
          } else {
            reel.rollingTime += delta * 16.667;
          }
        } else {
          reel.rollingTime = 0;
        }
      }
    });
  }

  // Check if any reel is still active
  get reelsActive() {
    return this.reels.some((reel) => reel.rolling === true || reel.stopping !== false);
  }

  // Add start callback
  onStart(fn) {
    this.onStartFns.push(fn);
  }

  // Add one-time start callback
  onceStart(fn) {
    fn.once = true;
    this.onStart(fn);
  }

  // Add stop command callback
  onStopCommand(fn) {
    this.onStopCommandFns.push(fn);
  }

  // Add stop callback
  onStop(fn) {
    this.onStopFns.push(fn);
  }

  // Add one-time stop callback
  onceStop(fn) {
    fn.once = true;
    this.onStop(fn);
  }
}

export default ReelsController;