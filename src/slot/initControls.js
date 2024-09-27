// File path: /royalgames-main/src/features/slot/initControls.js

import * as PIXI from 'pixi.js'; // Importing the PIXI.js library for rendering and animations
import gsap from 'gsap'; // Importing GSAP for animation handling

let onBtnTotalBetMinus, onBtnTotalBetPlus; // Declaring variables for button event handlers

// Main function to initialize game controls
function initControls(game) {
  // Hide the bet window when the reels start spinning
  game.reelsController.onStart(() => {
    betWindow.visible = false; // Ensure betWindow is defined and accessible in this scope
  });

  // Create a main container for the game controls
  const controls = new PIXI.Container(); // Creating a new PIXI container for controls
  controls.z = 10; // Setting the z-index to make sure controls are on top
  game.stage.addChild(controls); // Adding controls to the game stage

  // Add information text to the controls
  const infoText = new PIXI.Text('HOLD SPACE FOR TURBO SPIN', new PIXI.TextStyle({
    fontFamily: 'Archivo Black', // Font style
    fontSize: 22, // Font size
    fill: '#FFFFFF', // Text color
  }));
  infoText.anchor.set(0.5, 0.5); // Centering the anchor point
  infoText.x = 1280 / 2; // Positioning the text in the center of the screen
  controls.addChild(infoText); // Adding text to the controls container
  game.texts.push(infoText); // Keeping a reference to the text object in the game text array

  // Update info text based on spin count and reel activity
  let spinCount = 0; // Initializing spin count
  game.reelsController.onStop(() => {
    // Action to perform when the reels stop spinning
    if (++spinCount % 2 === 0) {
      infoText.text = 'SPIN TO WIN!'; // Update text based on spin count
    } else {
      infoText.text = 'PLACE YOUR BETS!'; // Alternate text based on spin count
    }
  });

  // Updating text based on active reels state
  game.ticker.add(() => {
    if (game.reelsController.reelsActive) { // When reels are active
      infoText.text = 'GOOD LUCK!'; // Display "Good Luck" message
    }
  });

  // Adding credits label and its value
  const creditsLabel = new PIXI.Text('CREDIT', {
    fontFamily: 'Archivo Black',
    fontSize: 20,
    fill: '#FDAD00', // Color for credits label
  });
  creditsLabel.x = 200; // Positioning credits label
  controls.addChild(creditsLabel); // Adding credits label to controls
  game.texts.push(creditsLabel); // Reference for later updates

  // Adding euro sign next to credits
  const creditsValueEuroSign = new PIXI.Text('€', {
    fontFamily: 'Archivo Black',
    fontSize: 20,
    fill: '#FFFFFF', // Color for euro sign
  });
  creditsValueEuroSign.x = creditsLabel.x + creditsLabel.width + 20; // Positioning euro sign
  creditsValueEuroSign.y = creditsLabel.y; // Aligning with the credits label
  controls.addChild(creditsValueEuroSign); // Adding euro sign to controls
  game.texts.push(creditsValueEuroSign); // Storing reference

  // Adding credits value based on game balance
  const creditsValue = new PIXI.Text(game.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), {
    fontFamily: 'Archivo Black',
    fontSize: 20,
    fill: '#FFFFFF', // Color for credit value
  });
  creditsValue.x = creditsValueEuroSign.x + creditsValueEuroSign.width + 5; // Positioning credits value
  controls.addChild(creditsValue); // Adding credits value to controls
  game.texts.push(creditsValue); // Storing reference

  // Update credits value when the game's balance changes
  game.onBalanceChange((balance) => {
    creditsValue.text = balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  });

  // Adding bet label and initial value display
  const betLabel = new PIXI.Text('BET', {
    fontFamily: 'Archivo Black',
    fontSize: 20,
    fill: '#FDAD00', // Color for bet label
  });
  betLabel.x = creditsLabel.x + creditsLabel.width - betLabel.width + 4; // Positioning bet label
  betLabel.y = creditsLabel.y + betLabel.height + 5; // Below credits label
  controls.addChild(betLabel); // Adding bet label to controls
  game.texts.push(betLabel); // Reference for later updates

  // Adding euro sign next to bet value
  const betValueEuroSign = new PIXI.Text('€', {
    fontFamily: 'Archivo Black',
    fontSize: 20,
    fill: '#FFFFFF', // Color for euro sign
  });
  betValueEuroSign.x = betLabel.x + betLabel.width + 16; // Positioning euro sign for bet value
  betValueEuroSign.y = betLabel.y; // Aligning with the bet label
  controls.addChild(betValueEuroSign); // Adding euro sign to controls
  game.texts.push(betValueEuroSign); // Storing reference

  // Adding bet value display based on game state
  const betValue = new PIXI.Text(game.betValueToLocale, {
    fontFamily: 'Archivo Black',
    fontSize: 20,
    fill: '#FFFFFF', // Color for bet value
  });
  betValue.x = betValueEuroSign.x + betValueEuroSign.width + 5; // Positioning bet value
  betValue.y = betLabel.y; // Aligning with the bet label
  controls.addChild(betValue); // Adding bet value to controls
  game.texts.push(betValue); // Storing reference

  // Update bet value when it changes
  game.onBetChange(() => {
    betValue.text = game.betValueToLocale; // Refreshing the displayed bet value
  });

  // Add win amount display container and its elements
  const winAmountContainer = new PIXI.Container();
  winAmountContainer.visible = false; // Initially hidden
  controls.addChild(winAmountContainer); // Adding to controls

  const winLabel = new PIXI.Text('WIN:', {
    fontFamily: 'Archivo Black',
    fontSize: 30,
    fill: '#FDAD00', // Color for win label
  });
  winAmountContainer.addChild(winLabel); // Adding win label to win amount container
  game.texts.push(winLabel); // Storing reference

  // Win amount text field for displaying win amounts
  const winAmountText = new PIXI.Text('', {
    fontFamily: 'Archivo Black',
    fontSize: 30,
    fill: '#FFFFFF', // Color for win amount
  });
  winAmountText.x = winLabel.width + 15; // Positioning to the right of win label
  winAmountContainer.addChild(winAmountText); // Adding text field to container
  game.texts.push(winAmountText); // Storing reference

  // Update win amount display based on the bet response
  game.ticker.add(() => {
    if (game.betResponse && game.betResponse.isWin && !game.reelsController.reelsActive) {
      infoText.visible = false; // Hide info text when there’s a win
      winAmountContainer.visible = true; // Show win amount container

      // Calculate total win amount from the responses
      let totalWinAmount = 0;
      game.betResponse.win.forEach((line) => {
        totalWinAmount += line.amount; // Accumulate win amounts
      });

      // Update the win amount text
      winAmountText.text = '€' + totalWinAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      // Center the win amount display
      winAmountContainer.x = (1280 / 2) - (winAmountContainer.width / 2);
    } else {
      winAmountContainer.visible = false; // Hide win amount container if not applicable
      infoText.visible = true; // Show info text
    }
  });

  // Add play button for starting gameplay
  const btnPlay = PIXI.Sprite.from('spin-icon'); // Load play button icon
  btnPlay.scale.x = 0.3;
  btnPlay.scale.y = 0.3;
  btnPlay.anchor.set(0.5, 0.5); // Centering the anchor for rotation
  btnPlay.x = 1100 - btnPlay.width; // Positioned to the right
  btnPlay.interactive = true; // Make button interactive
  btnPlay.on('pointerdown', () => {
    game.play(); // Callback to initiate play action
  });
  controls.addChild(btnPlay); // Adding button to the controls

  // Update play button texture based on game state
  game.ticker.add(() => {
    if (game.reelsController.reelsActive || game.autoplay) {
      btnPlay.texture = PIXI.Texture.from('stop-icon'); // Show stop icon when active
    } else {
      btnPlay.texture = PIXI.Texture.from('spin-icon'); // Show play icon when inactive
    }
  });

  // Add a circular background for the play button
  const btnPlayCircle = PIXI.Sprite.from('circle-icon'); // Circular background
  btnPlayCircle.x = btnPlay.x; // Center it with the play button
  btnPlayCircle.y = btnPlay.y;
  btnPlayCircle.scale.x = 0.3;
  btnPlayCircle.scale.y = 0.3;
  btnPlayCircle.anchor.set(0.5, 0.5);
  btnPlayCircle.interactive = true; // Make circle interactive
  btnPlayCircle.on('pointerdown', () => {
    game.play(); // Start game on circle press
  });
  controls.addChild(btnPlayCircle); // Adding to controls
  
  // Animate the play button circle rotation
  let btnPlayCircleRotation = {
    value: 0.1,
  };

  let btnPlayCircleRotationTween; // Variable for the rotation tween
  game.reelsController.onStart(() => {
    // Start line to animate the circle when reels start rotating
    btnPlayCircleRotation.value = 0.1;
    btnPlayCircleRotationTween = gsap.to(btnPlayCircleRotation, { value: 0.001, duration: 2 });
  });

  game.reelsController.onStop(() => {
    // Stop rotation tween when reels stop
    btnPlayCircleRotationTween.kill();
  });

  game.reelsController.onStopCommand(() => {
    btnPlayCircleRotationTween.progress(1); // Complete the tween if appropriate
  });

  PIXI.Ticker.shared.add(() => {
    if (game.reelsController.reelsActive) { // Rotate circle if reels are active
      btnPlayCircle.rotation -= btnPlayCircleRotation.value; // Adjust rotation based on set value
    }
  });

  // Animate play button rotation with GSAP timelines
  const btnPlayRotateTimeline = gsap.timeline({
    repeat: -1, // Infinite loop
    repeatDelay: 10, // Delay between repeats
    delay: 10, // Initial delay before the first rotation
  });

  // Rotate button
  btnPlayRotateTimeline.to(btnPlay, {
    rotation: Math.PI / 4, // Rotate to 45 degrees
    duration: 0.5,
    ease: 'power1',
  });

  // Rotate back to normal
  btnPlayRotateTimeline.to(btnPlay, {
    rotation: 0,
    duration: 0.5,
    ease: 'bounce',
  });

  game.reelsController.onStart(() => {
    btnPlayRotateTimeline.pause(); // Pause during reel start
    btnPlayRotateTimeline.progress(0); // Restart animation
  });

  game.reelsController.onStop(() => {
    if (!game.reelsController.reelsActive) {
      btnPlayRotateTimeline.restart(true); // Restart upon stopping
    }
  });

  // Add an autoplay button container
  const btnAutoplay = new PIXI.Container();
  btnAutoplay.x = btnPlay.x; // Align with play button
  btnAutoplay.y = 65;
  btnAutoplay.interactive = true; // Make button interactive
  btnAutoplay.on('pointerdown', () => { 
    game.autoplay = !game.autoplay; // Toggle autoplay state
  });
  controls.addChild(btnAutoplay); // Adding to controls

  const btnAutoplayBackground = new PIXI.Graphics();
  btnAutoplay.addChild(btnAutoplayBackground); // Add background for styling

  const btnAutoplayText = new PIXI.Text('AUTOPLAY', new PIXI.TextStyle({
    fontFamily: 'Archivo Black',
    fontSize: 12,
    fill: '#FFFFFF', // Color for autoplay text
  }));
  btnAutoplayText.anchor.set(0.5, 0.5);
  btnAutoplay.addChild(btnAutoplayText); // Adding to button
  game.texts.push(btnAutoplayText); // Track text element for updates

  // Update autoplay button color based on the game state
  game.ticker.add(() => {
    if (game.autoplay) {
      btnAutoplayText.tint = 0xB1071D; // Change color when active
    } else {
      btnAutoplayText.tint = 0xFFFFFF; // Default color
    }
  });

  // Style the autoplay button background
  const btnAutoplayTextPaddingX = 12;
  const btnAutoplayTextPaddingY = 2;
  btnAutoplayBackground.beginFill(0xFFFFFF, 1);
  btnAutoplayBackground.drawRoundedRect(
    btnAutoplayText.x - (btnAutoplayText.width / 2) - btnAutoplayTextPaddingX - 2,
    btnAutoplayText.y - (btnAutoplayText.height / 2) - btnAutoplayTextPaddingY - 2,
    btnAutoplayText.width + (btnAutoplayTextPaddingX * 2) + 4,
    btnAutoplayText.height + (btnAutoplayTextPaddingY * 2) + 4,
    12
  );
  btnAutoplayBackground.beginFill(0x000000, 1);
  btnAutoplayBackground.drawRoundedRect(
    btnAutoplayText.x - (btnAutoplayText.width / 2) - btnAutoplayTextPaddingX,
    btnAutoplayText.y - (btnAutoplayText.height / 2) - btnAutoplayTextPaddingY,
    btnAutoplayText.width + (btnAutoplayTextPaddingX * 2),
    btnAutoplayText.height + (btnAutoplayTextPaddingY * 2),
    12
  );
  btnAutoplayBackground.endFill();

  // Add bet minus button
  const btnBetMinusCircle = new PIXI.Graphics();
  btnBetMinusCircle.beginFill(0x000000, 0.4);
  btnBetMinusCircle.lineStyle(10, 0xFFFFFF); // Outline color
  btnBetMinusCircle.drawEllipse(0, 0, 100, 100); // Draw ellipse for button shape
  btnBetMinusCircle.endFill();
  btnBetMinusCircle.scale.x = 0.22;
  btnBetMinusCircle.scale.y = 0.22;
  btnBetMinusCircle.x = btnPlay.x - (btnPlay.width / 2) - btnBetMinusCircle.width; // Positioning
  btnBetMinusCircle.y = btnPlay.y + (btnPlay.height / 2) - (btnBetMinusCircle.height / 2) + 10;
  btnBetMinusCircle.interactive = true; // Make button interactive
  btnBetMinusCircle.on('pointerdown', () => {
    onBtnTotalBetMinus(); // Trigger the decrease bet function
    betWindow.visible = true; // Show the bet window
  });
  controls.addChild(btnBetMinusCircle); // Adding to controls

  const btnBetMinus = PIXI.Sprite.from('minus-icon'); // Load minus icon for button
  btnBetMinus.scale.x = 0.3;
  btnBetMinus.scale.y = 0.3;
  btnBetMinus.anchor.set(0.5, 0.5); // Centering the icon
  btnBetMinusCircle.addChild(btnBetMinus); // Adding icon to circle button

  // Add bet plus button
  const btnBetPlusCircle = new PIXI.Graphics();
  btnBetPlusCircle.beginFill(0x000000, 0.4);
  btnBetPlusCircle.lineStyle(10, 0xFFFFFF); // Outline color
  btnBetPlusCircle.drawEllipse(0, 0, 100, 100); // Draw ellipse for button shape
  btnBetPlusCircle.endFill();
  btnBetPlusCircle.scale.x = 0.22;
  btnBetPlusCircle.scale.y = 0.22;
  btnBetPlusCircle.x = btnPlay.x + (btnPlay.width / 2) + btnBetPlusCircle.width; // Position
  btnBetPlusCircle.y = btnPlay.y + (btnPlay.height / 2) - (btnBetPlusCircle.height / 2) + 10;
  btnBetPlusCircle.interactive = true; // Make button interactive
  btnBetPlusCircle.on('pointerdown', () => {
    onBtnTotalBetPlus(); // Trigger the increase bet function
    betWindow.visible = true; // Show the bet window
  });
  controls.addChild(btnBetPlusCircle); // Adding to controls

  const btnBetPlus = PIXI.Sprite.from('plus-icon'); // Load plus icon for button
  btnBetPlus.anchor.set(0.5, 0.5); // Centering the icon
  btnBetPlus.scale.x = 0.3;
  btnBetPlus.scale.y = 0.3;
  btnBetPlusCircle.addChild(btnBetPlus); // Adding icon to circle button

  // Initialize bet window function
  function initBetWindow(game, controls, betValue) {
    const container = new PIXI.Container(); // Container for the bet window
    container.x = 850; // Initial position on the x-axis
    container.y = -500; // Initial position on the y-axis
    controls.addChild(container); // Adding the container to controls

    // Create background for the bet window
    const background = new PIXI.Graphics();
    background.beginFill(0x000000, 0.9); // Semi-transparent background
    background.drawRoundedRect(0, 0, 280, 400, 10); // Creating a rounded rectangle
    background.endFill();
    container.addChild(background); // Adding background to container

    // Create a button to close the bet window
    const btnClose = PIXI.Sprite.from('xmark-icon'); // Load close icon
    btnClose.scale.set(0.07, 0.07); // Scaling the icon
    btnClose.x = container.width - btnClose.width - 10; // Positioning close button
    btnClose.y = 5; // Positioning on y-axis
    btnClose.interactive = true; // Make close button interactive
    btnClose.on('pointerdown', () => {
      container.visible = false; // Hide the bet window on close
    });
    container.addChild(btnClose); // Adding close button to container

    // Adding bet multiplier text to the bet window
    const betMultiplerText = new PIXI.Text('BET MULTIPLIER 10x', {
      fontFamily: 'Archivo Black',
      fontSize: 15,
      fill: '#FDAD00', // Color for the bet multiplier
    });
    betMultiplerText.anchor.set(0.5, 0); // Aligning text
    betMultiplerText.x = container.width / 2; // Center horizontally within the container
    betMultiplerText.y = 20; // Positioning vertically
    container.addChild(betMultiplerText); // Adding to container
    game.texts.push(betMultiplerText); // Track text for updates

    // Create bet value adjustment tool
    const betValueTool = createBetTool(game, 'BET');
    betValueTool.container.x = 0;
    betValueTool.container.y = betMultiplerText.y + betMultiplerText.height + 50; // Positioning below multiplier
    container.addChild(betValueTool.container); // Adding to container
    betValueTool.valueText.text = game.bet; // Display current bet

    // Decrease bet value on button press
    betValueTool.btnMinus.on('pointerdown', () => {
      if (game.bet > 1) { // Check to ensure a negative bet doesn't occur
        game.bet -= 1; // Decrement bet value
        betValueTool.valueText.text = game.bet; // Update displayed bet
        betValue.text = game.betValueToLocale; // Update bet value display
        totalBetTool.valueText.text = '€' + game.betValueToLocale; // Update total bet display
      }
    });

    // Increase bet value on button press
    betValueTool.btnPlus.on('pointerdown', () => {
      if (game.bet < 10) { // Check upper limit for bet
        game.bet += 1; // Increment bet value
        betValueTool.valueText.text = game.bet; // Update displayed bet
        betValue.text = game.betValueToLocale; // Update bet value display
        totalBetTool.valueText.text = '€' + game.betValueToLocale; // Update total bet display
      }
    });

    // Create a coin value adjustment tool
    const coinValueTool = createBetTool(game, 'COIN VALUE');
    coinValueTool.container.x = 0;
    coinValueTool.container.y = betValueTool.container.y + betValueTool.container.height + 30; // Position below bet tool
    container.addChild(coinValueTool.container); // Add to container
    coinValueTool.valueText.text = '€' + game.coinValue.toFixed(2); // Display current coin value

    // Decrement coin value on button press
    coinValueTool.btnMinus.on('pointerdown', () => {
      if (game.coinValueValueIndex > 0) { // Ensure not dropping below minimum index
        game.coinValueValueIndex--; // Adjust index for tree/array of values
        coinValueTool.valueText.text = '€' + game.coinValue.toFixed(2); // Update coin value display
        betValue.text = game.betValueToLocale; // Update bet value display
        totalBetTool.valueText.text = '€' + game.betValueToLocale; // Update total bet
      }
    });

    // Increment coin value on button press
    coinValueTool.btnPlus.on('pointerdown', () => {
      if (game.coinValueValueIndex < game.coinValueValues.length - 1) { // Ensure not exceeding maximum index
        game.coinValueValueIndex++; // Adjust index to next value
        coinValueTool.valueText.text = '€' + game.coinValue.toFixed(2); // Update coin value display
        betValue.text = game.betValueToLocale; // Update bet value display
        totalBetTool.valueText.text = '€' + game.betValueToLocale; // Update total bet display
      }
    });

    // Create the total bet adjustment tool
    const totalBetTool = createBetTool(game, 'TOTAL BET');
    totalBetTool.container.x = 0;
    totalBetTool.container.y = coinValueTool.container.y + coinValueTool.container.height + 30; // Position below coin value
    container.addChild(totalBetTool.container); // Adding to container
    totalBetTool.valueText.text = '€' + game.betValueToLocale; // Initialize displayed total bet

    // Handle bet decrement
    onBtnTotalBetMinus = () => {
      let betDecreased = false;

      let b = game.bet, cvvi = game.coinValueValueIndex, tb;
      while (!betDecreased && (b > 1 || cvvi > 0)) {
        if (b === 1) {
          if (cvvi > 0) {
            cvvi--; // Move to previous coin value
            b = 10; // Max back to 10 for next loop
          }
        } else {
          b--; // Decrement bet
        }

        tb = b * 10 * game.coinValueValues[cvvi]; // Calculate total bet value
        const currentBet = game.betValue; // Current total bet
        betDecreased = tb < currentBet; // Check if decreased bet is accepted
      }

      game.bet = b; // Set the final bet value in game
      game.coinValueValueIndex = cvvi; // Update coin value index

      // Update display fields
      betValueTool.valueText.text = game.bet;
      coinValueTool.valueText.text = '€' + game.coinValue.toFixed(2);
      totalBetTool.valueText.text = '€' + game.betValueToLocale;
      betValue.text = game.betValueToLocale;
    };

    totalBetTool.btnMinus.on('pointerdown', onBtnTotalBetMinus); // Attach event handler for minus button

    // Handle bet increment
    onBtnTotalBetPlus = () => {
      let betIncreased = false;

      let b = game.bet, cvvi = game.coinValueValueIndex, tb;
      while (!betIncreased && (b < 10 || cvvi < game.coinValueValues.length - 1)) {
        if (b === 10) {
          if (cvvi < game.coinValueValues.length - 1) {
            cvvi++; // Move to next coin value
            b = 1; // Reset bet
          }
        } else {
          b++; // Increment bet
        }

        tb = b * 10 * game.coinValueValues[cvvi]; // Calculate total bet value
        const currentBet = game.betValue; // Current total bet
        betIncreased = tb > currentBet; // Check if increased bet is accepted
      }

      game.bet = b; // Set the final bet value in game
      game.coinValueValueIndex = cvvi; // Update coin value index

      // Update display fields
      betValueTool.valueText.text = game.bet;
      coinValueTool.valueText.text = '€' + game.coinValue.toFixed(2);
      totalBetTool.valueText.text = '€' + game.betValueToLocale;
      betValue.text = game.betValueToLocale;
    };
    totalBetTool.btnPlus.on('pointerdown', onBtnTotalBetPlus); // Attach event handler for plus button

    return container; // Return the bet window container for use
  }

  // Helper function to create bet adjustment tools
  function createBetTool(game, label) {
    const container = new PIXI.Container(); // Create a container for the tool

    // Create label for the tool
    const labelText = new PIXI.Text(label, {
      fontFamily: 'Archivo Black',
      fontSize: 15,
      fill: '#FFFFFF', // Color for the label
    });
    labelText.anchor.set(0.5, 0.5); // Set anchor for centering
    container.addChild(labelText); // Add label to container
    game.texts.push(labelText); // Store for future updates

    // Create minus button
    const btnMinusCircle = new PIXI.Graphics();
    btnMinusCircle.beginFill(0xFFFFFF); // Color for the button
    btnMinusCircle.drawCircle(0, 0, 25); // Draw circle for button shape
    btnMinusCircle.x = btnMinusCircle.width; // Position to the right of the label
    btnMinusCircle.y = labelText.height + 30; // Position below the label
    btnMinusCircle.interactive = true; // Make the button interactive
    container.addChild(btnMinusCircle); // Add to container

    const btnMinusIcon = PIXI.Sprite.from('minus-icon'); // Load minus icon
    btnMinusIcon.scale.set(0.07, 0.07); // Scale the icon
    btnMinusIcon.anchor.set(0.5, 0.5); // Center the icon
    btnMinusIcon.tint = 0x333333; // Set tint color for the icon
    btnMinusCircle.addChild(btnMinusIcon); // Add icon to minus button

    // Create value display for the bet
    const valueBackgroundBorder = new PIXI.Graphics();
    valueBackgroundBorder.beginFill(0x444444);
    valueBackgroundBorder.drawRoundedRect(0, 0, 100, 50, 5); // Create a rounded rectangle for the value display
    valueBackgroundBorder.endFill();
    valueBackgroundBorder.x = btnMinusCircle.x + (btnMinusCircle.width / 2) + 15; // Position next to minus button
    valueBackgroundBorder.y = btnMinusCircle.y - (btnMinusCircle.height / 2); // Center vertically
    container.addChild(valueBackgroundBorder); // Adding background to display

    const valueBackground = new PIXI.Graphics();
    valueBackground.beginFill(0x222222);
    valueBackground.drawRoundedRect(3, 3, 94, 44, 5); // Inner background styling
    valueBackground.endFill();
    valueBackgroundBorder.addChild(valueBackground); // Add inner background to the border

    const valueText = new PIXI.Text('', {
      fontFamily: 'Google Sans',
      fontWeight: 800,
      fontSize: 16,
      fill: '#FFFFFF', // Color for the value text
    });
    valueText.anchor.set(0.5, 0.5); // Center the text
    valueText.x = valueBackgroundBorder.width / 2; // Center horizontally
    valueText.y = valueBackgroundBorder.height / 2; // Center vertically
    valueBackgroundBorder.addChild(valueText); // Add to border
    game.texts.push(valueText); // Store for updates

    // Create plus button
    const btnPlusCircle = new PIXI.Graphics();
    btnPlusCircle.beginFill(0x00B862); // Color for plus button
    btnPlusCircle.drawCircle(0, 0, 25); // Draw circle button
    btnPlusCircle.x = valueBackgroundBorder.x + valueBackgroundBorder.width + (btnPlusCircle.width / 2) + 15; // Position
    btnPlusCircle.y = btnMinusCircle.y; // Align with the minus button
    btnPlusCircle.interactive = true; // Make the button interactive
    container.addChild(btnPlusCircle); // Adding plus button to container

    const btnPlusIcon = PIXI.Sprite.from('plus-icon'); // Load plus icon
    btnPlusIcon.scale.set(0.07, 0.07); // Scale the icon
    btnPlusIcon.anchor.set(0.5, 0.5); // Center the icon
    btnPlusIcon.tint = 0xFFFFFF; // Set tint color for the icon
    btnPlusCircle.addChild(btnPlusIcon); // Add icon to the plus button

    labelText.x = valueBackgroundBorder.x + (valueBackgroundBorder.width / 2); // Center label text in the tool

    return { container, valueText, btnMinus: btnMinusCircle, btnPlus: btnPlusCircle }; // Return relevant tools
  }
}
export default initControls; // Export the main function for use in other modules