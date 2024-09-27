// File path: /royalgames-main/src/features/slot/Reel.js

import * as PIXI from 'pixi.js';
import anime from 'animejs';

// Reel constructor function
const Reel = function({
  positions,
  spinValues,
  speed,
  useBlurredSymbols,
  bounceDepthPerc,
  bounceDuration,
  symbolMargin,
  maskPaddingX,
  maskPaddingY,
}) {
  // Initialize properties
  this.positions = positions;
  this.values = [];
  this._spinValues = spinValues.slice();
  this.spinValues = spinValues.slice();
  this.stopValues = [];
  this.symbols = [];
  this.container = new PIXI.Container();
  this.mask = new PIXI.Graphics();
  this.offset = 0;
  this.rolling = false;
  this.stopping = false;
  this.symbolMargin = symbolMargin;
  this.speed = speed;
  this.bounceDepthPerc = bounceDepthPerc;
  this.bounceDuration = bounceDuration;
  this.stopFns = [];
  this.startFns = [];
  this.maskPaddingX = maskPaddingX || 0;
  this.maskPaddingY = maskPaddingY || 0;
  this.useBlurredSymbols = useBlurredSymbols || false;

  // Apply mask to container
  this.container.mask = this.mask;

  // Create initial symbols
  for (var i = 0; i < positions + 1; i++) {
    var symbol = new PIXI.Sprite(PIXI.Texture.EMPTY);
    this.container.addChild(symbol);
    this.symbols.push(symbol);
  }
};

// Render method to update reel visuals
Reel.prototype.render = function() {
  var _this = this;

  // Update mask
  var m = _this.mask;
  m.x = _this.container.x;
  m.y = _this.container.y;
  m.clear();
  m.beginFill(0x000000);
  m.drawRect(0 - this.maskPaddingX, 0 - this.maskPaddingY, _this.symbols[0].width + (this.maskPaddingX * 2), ((_this.symbols[0].height + this.symbolMargin + this.maskPaddingY) * _this.positions) - this.symbolMargin);
  m.endFill();

  // Update symbol positions and textures
  for (var i = 0; i < _this.symbols.length; i++) {
    var symbol = _this.symbols[i];
    symbol.anchor.set(0.5, 0.5);
    let symbolWidth = 0, symbolHeight = 0;

    if (_this.values[i]) {
      if (this.rolling) {
        if (this.useBlurredSymbols) {
          symbol.texture = PIXI.Texture.from('symbol-' + _this.values[i] + '-blurred');
        } else {
          symbol.texture = PIXI.Texture.from('symbol-' + _this.values[i]);
        }
      } else {
        symbol.texture = PIXI.Texture.from('symbol-' + _this.values[i]);
      }

      symbolWidth = symbol.width;
      symbolHeight = symbol.height;
    } else {
      symbol.texture = PIXI.Texture.EMPTY;
    }

    if (symbol.hide) {
      symbol.texture = PIXI.Texture.EMPTY;
    }

    symbol.x = symbolWidth / 2;
    symbol.y = ((symbolHeight + this.symbolMargin) * (i - 1)) + (0 + _this.offset);
    symbol.y += symbolHeight / 2;
  }

  // Handle rolling animation
  if (this.rolling) {
    this.offset += this.symbols[0].height * this.speed;

    if (this.offset >= this.symbols[0].height) {
      this.offset = 0;
      if (!isNaN(parseInt(this.stopping))) {
        this.values.unshift(this.stopValues.pop());
        this.stopping++;
      } else {
        this.values.unshift(this._spinValues.pop());

        if (this._spinValues.length === 0) {
          this._spinValues = this.spinValues.slice();
        }
      }
      this.values.splice(-1, 1);
    }

    // Handle stopping animation
    if (this.stopping === this.positions + 1) {
      this.rolling = false;
      this.stopping++;
      var o = {
        offset: _this.symbols[0].height * this.bounceDepthPerc,
      };
      this.offset = o.offset;
      anime({
        targets: o,
        offset: 0,
        round: 1,
        duration: this.bounceDuration,
        easing: 'easeOutQuint',
        update: function() {
          _this.offset = o.offset;
        },
        complete: function() {
          _this.stopping = false;
          
          // Execute stop functions
          for (let i = 0; i < _this.stopFns.length; i++) {
            const fn = _this.stopFns[i];

            if (fn.once) {
              _this.stopFns.splice(i--, 1);
            }

            fn();
          }
        },
      });
    }
  }
};

// Start rolling the reel
Reel.prototype.roll = function() {
  if (!this.rolling && this.stopping === false) {
    this.rolling = true;

    // Execute start functions
    for (let i = 0; i < this.startFns.length; i++) {
      const fn = this.startFns[i];

      if (fn.once) {
        this.startFns.splice(i--, 1);
      }

      fn();
    }
  }
};

// Stop the reel
Reel.prototype.stop = function() {
  if (this.rolling && this.stopping === false) {
    this.stopping = 0;
  }
};

// Add a one-time stop function
Reel.prototype.onceStop = function(fn) {
  fn.once = true;
  this.stopFns.push(fn);
};

// Add a recurring stop function
Reel.prototype.onStop = function(fn) {
  this.stopFns.push(fn);
};

// Add a one-time start function
Reel.prototype.onceStart = function(fn) {
  fn.once = true;
  this.startFns.push(fn);
};

// Add a recurring start function
Reel.prototype.onStart = function(fn) {
  this.startFns.push(fn);
};

export default Reel;