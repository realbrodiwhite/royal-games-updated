// File path: /royalgames-main/src/features/slot/SlotGame.js

import * as PIXI from 'pixi.js';
import ReelsController from './ReelsController';
import gsap from 'gsap';

class SlotGame {
  // Arrays to store callback functions for various game events
  onInitFns = [];
  onDestroyFns = [];
  onBalanceChangeFns = [];
  onBetChangeFns = [];
  onCoinValueChangeFns = [];
  onLoadingFns = [];
  onPlayFns = [];

  constructor({
    id,
    width,
    height,
    reelsCount,
    reelPositions,
    symbolsCount,
    hasBlurredSymbols,
    symbolMargin,
    maskPaddingX,
    maskPaddingY,
    reelsSpeed,
    spinTime,
    spinTimeBetweenReels,
  }, socket) {
    // Initialize game properties
    this.id = id;
    this.width = width;
    this.height = height;
    this.reelsCount = reelsCount;
    this.reelPositions = reelPositions;
    this.symbolsCount = symbolsCount;
    this.hasBlurredSymbols = hasBlurredSymbols || false;
    this.symbolMargin = symbolMargin || 0;
    this.maskPaddingX = maskPaddingX || 0;
    this.maskPaddingY = maskPaddingY || 0;
    this.reelsSpeed = reelsSpeed || 0.18;
    this.spinTime = spinTime;
    this.spinTimeBetweenReels = spinTimeBetweenReels;
    this.socket = socket;

    // Set up PIXI renderer
    this.renderer = new PIXI.autoDetectRenderer({
      width: window.innerWidth,
      height: window.innerHeight,
      antialias: true,
    });

    // Create main stage container
    this.stage = new PIXI.Container();

    // Set up PIXI ticker for animations
    this.ticker = new PIXI.Ticker();

    // Add render function to ticker
    this.ticker.add(() => {
      this.renderer.render(this.stage);
    });

    // Initialize assets and sound assets
    this.assets = [];
    this.soundAssets = {
      reelsRun: new Audio(`/data/reels-run.mp3`),
      reelStop: new Audio(`/data/reel-stop.mp3`),
      winEffect: new Audio(`/data/win.mp3`),
      coinsEffect: new Audio(`/data/coins.mp3`),
    };

    // Initialize arrays for sprites and texts
    this.sprites = [];
    this.texts = [];

    // Set initial game state
    this._bet = 1;
    this.coinValueValues = [0.01, 0.03, 0.10, 0.20, 0.50];
    this._coinValueValueIndex = 0;
    this._balance = 0;

    this.autoplay = false;
    this.creditsTweenCompleted = true;
  }

  // Method to add init callback
  onInit(fn) {
    this.onInitFns.push(fn);
  }

  // Method to add destroy callback
  onDestroy(fn) {
    this.onDestroyFns.push(fn);
  }

  // Method to handle game resizing
  resize() {
    // Calculate new dimensions while maintaining aspect ratio
    const gameRatio = this.width / this.height;
    const windowRatio = window.innerWidth / window.innerHeight;
    let width, height;

    if (windowRatio < gameRatio) {
      width = window.innerWidth;
      height = width / gameRatio;
    } else {
      height = window.innerHeight;
      width = height * gameRatio;
    }

    // Resize renderer and scale stage
    this.renderer.resize(width, height);

    this.stage.scale.x = this.renderer.view.width / this.width;
    this.stage.scale.y = this.renderer.view.height / this.height;
  }

  // Method to initialize the game
  init() {
    // Initialize reels controller
    this.reelsController = new ReelsController(this, this.spinTime, this.spinTimeBetweenReels);

    // Resize game to fit window
    this.resize();

    // Call all init callbacks
    this.onInitFns.forEach((fn) => fn());

    // Sort stage children by z-index
    this.stage.children.sort(function(a, b) {
      if (a.z > b.z) {
        return 1;
      } else {
        return -1;
      }
    });

    // Set up window resize listener
    const onWindowResize = () => {
      setTimeout(() => {
        this.resize();
      }, 50);
    };

    window.addEventListener('resize', onWindowResize);

    // Add cleanup function for resize listener
    this.onDestroy(() => {
      window.removeEventListener('resize', onWindowResize);
    });

    // Set up socket listeners for game state and bets
    this.onNetworkGamestate = (state) => {
      this.processGamestate(state);
    };
    this.socket.on('gamestate', this.onNetworkGamestate);

    this.onNetworkBet = (data) => {
      this.processBet(data);
    };
    this.socket.on('bet', this.onNetworkBet);

    // Set up ticker for text updates
    this.ticker.add(() => {
      this.texts.forEach((text) => {
        const t = text.text;
        text.text = '';
        text.text = t;
      });
    });
    
    // Set up ticker for autoplay
    this.ticker.add(() => {
      if (this.autoplay) {
        if (!this.reelsController.reelsActive) {
          if (this.betResponse === null || !this.betResponse.isWin || this.creditsTweenCompleted) {
            this.play();
          }
        }
      }
    });

    // Set up key press listener for play action
    this.onActionButtonPressed = (e) => {
      if (e.code === 'Space' || e.code === 'Numpad0') {
        this.play();
      }
    };
    window.addEventListener('keypress', this.onActionButtonPressed);
  }

  // Method to start the game
  start() {
    // Load assets and initialize game
    PIXI.Assets.addBundle(this.id, this.assets);
    PIXI.Assets.loadBundle(this.id, (progress) => {
      this.onLoadingFns.forEach((fn) => {
        fn(progress);
      });
    }).then(() => {
      this.init();

      this.socket.emit('gamestate', {
        key: localStorage.getItem('key'),
        gameId: this.id,
      });
    });
  }

  // Method to register loading callback
  onLoading(fn) {
    this.onLoadingFns.push(fn);
  }

  // Method to handle play action
  play() {
    if (this.reelsController.reelsActive) {
      // Handle stopping the reels
      if (this.betResponse) {
        this.reelsController.onStopCommandFns.forEach((fn) => fn());
  
        if (this.reelsController.reels.some((r) => (r.rolling === true || r.stopping < r.positions + 1) && !(r.forceStopped || r.stoppedAutomatically))) {
          this.soundAssets.reelsRun.pause();
          new Audio(this.soundAssets.reelStop.src).play();
        }

        this.reelsController.reels.forEach((r, i) => {
          if ((r.rolling === true || r.stopping < r.positions + 1) && !(r.forceStopped || r.stoppedAutomatically)) {
            r.values = this.betResponse.reels[i].slice();
            r.offset = 0;
            r.stopping = r.positions + 1;
            r.forceStopped = true;
          }
        });
      }

      if (!this.reelsController.stopCommandGiven) {
        this.reelsController.stopCommandGiven = true;
        this.autoplay = false;

        for (let i = 0; i < this.onPlayFns.length; i++) {
          const fn = this.onPlayFns[i];
          fn();

          if (fn.once) {
            this.onPlayFns.splice(i--, 1);
          }
        }
      }
    } else {
      // Handle starting a new spin
      this.socket.emit('bet', {
        key: localStorage.getItem('key'),
        gameId: this.id,
        bet: this.bet,
        coinValue: this.coinValue,
      });

      this.betResponse = null;
      this.reelsController.stopCommandGiven = false;
      this.balance -= Math.round(this.betValue * 100) / 100;
  
      this.reelsController.reels.forEach((r) => {
        r.stoppedAutomatically = false;
        r.forceStopped = false;
        r.roll();
  
        r.onceStop(() => {
          if (!this.reelsController.reelsActive) {
            for (let i = 0; i < this.reelsController.onStopFns.length; i++) {
              const fn = this.reelsController.onStopFns[i];
  
              if (fn.once) {
                this.reelsController.onStopFns.splice(i--, 1);
              }
              
              fn();
            }
          }

          this.soundAssets.reelsRun.pause();
        });
      });

      this.soundAssets.reelsRun.loop = true;
      this.soundAssets.reelsRun.currentTime = 0;
      this.soundAssets.reelsRun.play();
  
      for (let i = 0; i < this.reelsController.onStartFns.length; i++) {
        const fn = this.reelsController.onStartFns[i];
  
        if (fn.once) {
          this.reelsController.onStartFns.splice(i--, 1);
        }
  
        fn();
      }

      for (let i = 0; i < this.onPlayFns.length; i++) {
        const fn = this.onPlayFns[i];
        fn();

        if (fn.once) {
          this.onPlayFns.splice(i--, 1);
        }
      }
    }
  }

  // Method to register play callback
  onPlay(fn) {
    this.onPlayFns.push(fn);
  }

  // Method to register one-time play callback
  oncePlay(fn) {
    fn.once = true;
    this.onPlay(fn);
  }

  // Method to process game state from server
  processGamestate(state) {
    this.balance = state.balance;
    this.coinValueValueIndex = this.coinValueValues.indexOf(state.coinValue);
    this.bet = state.bet;

    state.reels.forEach((reelValues, i) => {
      this.reelsController.reels[i].values = reelValues;
    });

    this.ticker.start();
  }

  // Method to process bet response from server
  processBet(data) {
    this.balance = data.balance;
    
    data.reels.forEach((reelValues, i) => {
      this.reelsController.reels[i].stopValues = reelValues.slice();
    });

    if (data.isWin) {
      let totalWin = 0;
      data.win.forEach((line) => totalWin += line.amount);
      this.balance -= totalWin;
  
      const o = { balance: this.balance };
      this.creditsTweenCompleted = false;
      this.reelsController.onceStop(() => {
        const creditsTween = gsap.to(o, {
          balance: this.balance + totalWin,
          duration: 3,
          onUpdate: () => {
            this.balance = o.balance;
          },
          onComplete: () => {
            this.balance = data.balance;
            this.creditsTweenCompleted = true;
          },
        });

        this.reelsController.onceStart(() => {
          setTimeout(() => {
            if (creditsTween && creditsTween.isActive()) {
              creditsTween.progress(1);
              creditsTween.kill();
            }
          });
        });
      });
    }

    this.betResponse = data;

    if (this.reelsController.stopCommandGiven) {
      this.play();
    }
  }

  // Method to add resources to the game
  addResource(resource) {
    if (resource.constructor === Array) {
      this.assets = [
        ...this.assets,
        ...resource.map((r) => {
          return {
            name: r.name,
            srcs: r.source,
          };
        }),
      ];
    } else {
      this.assets.push({
        name: resource.name,
        srcs: resource.source,
      });
    }
  }

  // Method to add sprite to the game
  addSprite(resourceKey) {
    const sprite = PIXI.Sprite.from(resourceKey);

    this.sprites.push(sprite);
    this.stage.addChild(sprite);

    return sprite;
  }

  // Method to add interactive button to the game
  addButton(resources, onClick) {
    const sprite = PIXI.Sprite.from(resources[0]);
    sprite.interactive = true;

    sprite.on('pointerenter', () => {
      if (sprite.disabled) {
        sprite.texture = PIXI.Texture.from(resources[3]);
      } else {
        sprite.texture = PIXI.Texture.from(resources[1]);
      }
    });

    let isDown = false;
    sprite.on('pointerdown', () => {
      if (sprite.disabled) {
        sprite.texture = PIXI.Texture.from(resources[3]);
      } else {
        sprite.texture = PIXI.Texture.from(resources[2]);
      }
      isDown = true;
    });

    sprite.on('pointerleave', () => {
      if (sprite.disabled) {
        sprite.texture = PIXI.Texture.from(resources[3]);
      } else {
        sprite.texture = PIXI.Texture.from(resources[0]);
      }
    });

    sprite.on('pointerup', () => {
      if (isDown) {
        onClick();

        if (sprite.disabled) {
          sprite.texture = PIXI.Texture.from(resources[3]);
        } else {
          sprite.texture = PIXI.Texture.from(resources[0]);
        }
        
        isDown = false;
      }
    });

    this.sprites.push(sprite);
    this.stage.addChild(sprite);

    return sprite;
  }

  // Method to destroy the game
  destroy() {
    this.ticker.stop();
    this.stage.destroy();
    this.socket.off('gamestate', this.onNetworkGamestate);
    this.socket.off('bet', this.onNetworkBet);
    window.removeEventListener('keypress', this.onActionButtonPressed);
    this.onDestroyFns.forEach((fn) => fn());
    PIXI.Assets.unloadBundle(this.id);
  }

  // Getter for current coin value
  get coinValue() {
    return this.coinValueValues[this.coinValueValueIndex];
  }

  // Getter for current bet value
  get betValue() {
    return this.bet * 10 * this.coinValue;
  }

  // Getter for formatted bet value
  get betValueToLocale() {
    return this.betValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Setter for balance
  set balance(value) {
    this._balance = value;
    // Trigger all registered balance change callbacks
    this.onBalanceChangeFns.forEach((fn) => fn(this._balance));
  }

  // Getter for balance
  get balance() {
    return this._balance;
  }

  // Method to register balance change callback
  onBalanceChange(fn) {
    this.onBalanceChangeFns.push(fn);
  }

  // Setter for bet
  set bet(value) {
    this._bet = value;
    // Trigger all registered bet change callbacks
    this.onBetChangeFns.forEach((fn) => fn(this._bet));
  }

  // Getter for bet
  get bet() {
    return this._bet;
  }

  // Method to register bet change callback
  onBetChange(fn) {
    this.onBetChangeFns.push(fn);
  }

  // Setter for coin value index
  set coinValueValueIndex(value) {
    this._coinValueValueIndex = value;
    // Trigger all registered coin value change callbacks
    this.onCoinValueChangeFns.forEach((fn) => fn(this.coinValueValues[this._coinValueValueIndex]));
  }

  // Getter for coin value index
  get coinValueValueIndex() {
    return this._coinValueValueIndex;
  }

  // Method to register coin value change callback
  onCoinValueChange(fn) {
    this.onCoinValueChangeFns.push(fn);
  }
}

export default SlotGame;