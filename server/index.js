// File path: /royalgames-main/server/index.js

const sqlite3 = require('sqlite3').verbose();
const md5 = require('md5');
const { 
  v1: uuidv1,
  v4: uuidv4,
} = require('uuid');
const Server = require('./server');
const rockClimberData = require('./games-data/rock-climber');
const egyptianTreasuresData = require('./games-data/egyptian-treasures');

// Connect to SQLite database
let db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the database.');

    // Initialize and start the server
    const server = new Server();
    const io = server.start();

    initIo(io);
  }
});

// Close database connection on process exit
process.on('exit', function() {
  db.close();
});

// Initialize Socket.IO event handlers
function initIo(io) {
  io.on('connection', (socket) => {
    // Handle user login
    socket.on('login', async (data) => {
      if (data.key === null) {
        // Create a new user
        const key = md5(uuidv1());
        const username = 'Guest';
        const balance = 10000.00;
        try {
          await createNewUser(username, balance, key);

          socket.emit('login', {
            status: 'logged-in',
            key,
            username,
            balance,
          });
        } catch (err) {
          console.log(err);
        }
      } else if (data.key) {
        // Login existing user
        try {
          const user = await getUser(data.key);

          socket.emit('login', {
            status: 'logged-in',
            key: data.key,
            username: user.username,
            balance: user.balance,
          });
        } catch (err) {
          console.log(err);
        }
      }
    });

    // Handle balance request
    socket.on('balance', async (data) => {
      try {
        const account = await getUser(data.key);

        socket.emit('balance', account.balance);
      } catch (err) {
        console.log(err);
      }
    });

    // Handle game state request
    socket.on('gamestate', async (data) => {
      try {
        const account = await getUser(data.key);
        const gamestate = await getOrCreateGamestate(account.id, data.gameId);

        socket.emit('gamestate', {
          balance: account.balance,
          bet: gamestate.bet,
          coinValue: gamestate.coin_value,
          reels: JSON.parse(gamestate.reels),
        });
      } catch (err) {
        console.log(err);
      }
    });

    // Handle bet request
    socket.on('bet', async (data) => {
      try {
        const account = await getUser(data.key);
        const betAmount = Math.round((data.bet * 10 * data.coinValue) * 100) / 100;
        if (account.balance >= betAmount) {
          const betResult = generateBetResult(data.gameId, betAmount);
          
          let winAmount = 0;
          betResult.lines.forEach((line) => {
            winAmount += line.amount;
          });

          const newBalance = (Math.round((account.balance - betAmount + winAmount) * 100) / 100);

          await updateBalance(account.id, newBalance);
          await updateGamestate(account.id, data.gameId, data.bet, data.coinValue, JSON.stringify(betResult.position));

          socket.emit('bet', {
            balance: newBalance,
            reels: betResult.position,
            isWin: betResult.lines.length > 0,
            win: betResult.lines,
          });
        }
      } catch (err) {
        console.log(err);
      }
    });
  });
}

// Generate random reel positions for a game
function generateRandomReelsPosition(gameId) {
  const position = [];
  let reelsCount, reelPositions, symbolsCount;

  switch (gameId) {
    case 'rock-climber':
      reelsCount = rockClimberData.reelsCount;
      reelPositions = rockClimberData.reelPositions;
      symbolsCount = rockClimberData.symbolsCount;
      break;
    case 'egyptian-treasures':
      reelsCount = egyptianTreasuresData.reelsCount;
      reelPositions = egyptianTreasuresData.reelPositions;
      symbolsCount = egyptianTreasuresData.symbolsCount;
      break;
  }

  for (let i = 0; i < reelsCount; i++) {
    position.push(Array.from(Array(reelPositions + 1)).map(() => {
      return parseInt(Math.random() * symbolsCount) + 1;
    }));
  }

  return position;
}

// Generate bet result for a game
function generateBetResult(gameId, betAmount) {
  const result = {};
  let position, lines;

  switch (gameId) {
    case 'rock-climber':
      position = generateRandomReelsPosition(gameId);
      break;
    case 'egyptian-treasures':
      position = generateRandomReelsPosition(gameId);
      break;
  }

  lines = processReelsPosition(gameId, betAmount, position);

  return {
    position,
    lines,
  };
}

// Process reel positions to determine winning lines
function processReelsPosition(gameId, betAmount, position) {
  const result = [];
  let linesPositions, symbolsMultipliers;

  switch (gameId) {
    case 'rock-climber':
      linesPositions = rockClimberData.linesPositions;
      symbolsMultipliers = rockClimberData.symbolsMultipliers;
      break;
    case 'egyptian-treasures':
      linesPositions = egyptianTreasuresData.linesPositions;
      symbolsMultipliers = egyptianTreasuresData.symbolsMultipliers;
      break;
  }

  linesPositions.forEach((linePosition, i) => {
    let symbolsInLine = [];
    for (let j = 0; j < linePosition.length; j++) {
      for (let k = 0; k < linePosition[j].length; k++) {
        if (linePosition[j][k] === 1) {
          symbolsInLine.push(position[j][k]);
        }
      }
    }

    let identicalSymbol = symbolsInLine[0];
    let identicalSymbolsCount = 1;
    for (let j = 1; j < symbolsInLine.length; j++) {
      if (identicalSymbol === symbolsInLine[j]) {
        identicalSymbolsCount++;
      } else {
        break;
      }
    }

    if (identicalSymbolsCount >= 3) {
      result.push({
        number: i + 1,
        symbol: identicalSymbol,
        count: identicalSymbolsCount,
        map: linePosition,
        amount: Math.round(betAmount * symbolsMultipliers[identicalSymbol][identicalSymbolsCount - 3].multiplier * 100) / 100,
      });
    }
  });

  return result;
}

// Create a new user in the database
function createNewUser(username, balance, key) {
  let resolveFn;
  let rejectFn;
  const creationPromise = new Promise((resolve, reject) => {
    resolveFn = resolve;
    rejectFn = reject;
  });

  db.run(`INSERT INTO accounts (username, balance, key) VALUES (?, ?, ?)`, [username, balance, key], function(err) {
    if (err) {
      rejectFn(err.message);
    } else {
      resolveFn(this.lastID);
    }
  });

  return creationPromise;
}

// Get user data from the database
function getUser(key) {
  let resolveFn;
  let rejectFn;
  const getUserPromise = new Promise((resolve, reject) => {
    resolveFn = resolve;
    rejectFn = reject;
  });

  db.all(`SELECT * FROM accounts WHERE key = ?`, [key], function(err, rows) {
    if (err) {
      rejectFn(err.message);
    } else {
      if (rows.length === 1) {
        db.run(`UPDATE accounts SET last_login = ? WHERE id = ?`, [(new Date()).getTime(), rows[0].id], function(err) {
          if (err) {
            rejectFn(err.message);
          } else {
            resolveFn(rows[0]);
          }
        });
      } else {
        rejectFn('Invalid key. Cannot get user.');
      }
    }
  });

  return getUserPromise;
}

// Get or create game state for a user
function getOrCreateGamestate(userId, gameId) {
  let resolveFn;
  let rejectFn;
  const getGamestatePromise = new Promise((resolve, reject) => {
    resolveFn = resolve;
    rejectFn = reject;
  });

  db.all(`SELECT * FROM gamestates WHERE user_id = ? AND game_id = ?`, [userId, gameId], async function(err, rows) {
    if (err) {
      rejectFn(err.message);
    } else {
      if (rows.length === 1) {
        // retrieve gamestate
        resolveFn(rows[0]);
      } else {
        // create new gamestate
        const bet = 10;
        const coinValue = 0.10;
        const reels = JSON.stringify(generateRandomReelsPosition(gameId));
        
        const newGamestate = await new Promise((resolve) => {
          db.run(`INSERT INTO gamestates (user_id, game_id, reels, bet, coin_value) VALUES (?, ?, ?, ?, ?)`, [
            userId,
            gameId,
            reels,
            bet,
            coinValue,
          ], function(err) {
            if (err) {
              rejectFn(err.message);
            } else {
              resolve({ reels, bet, coin_value: coinValue });
            }
          });
        });

        resolveFn(newGamestate);
      }
    }
  });

  return getGamestatePromise;
}

// Update user balance in the database
function updateBalance(userId, value) {
  let resolveFn;
  let rejectFn;
  const updateBalancePromise = new Promise((resolve, reject) => {
    resolveFn = resolve;
    rejectFn = reject;
  });

  db.run(`UPDATE accounts SET balance = ? WHERE id = ?`, [value, userId], function(err) {
    if (err) {
      rejectFn(err.message);
    } else {
      resolveFn();
    }
  });

  return updateBalancePromise;
}

// Update game state in the database
function updateGamestate(userId, gameId, bet, coinValue, reelsPosition) {
  let resolveFn;
  let rejectFn;
  const updateGamestatePromise = new Promise((resolve, reject) => {
    resolveFn = resolve;
    rejectFn = reject;
  });

  db.run(`UPDATE gamestates SET reels = ?, bet = ?, coin_value = ? WHERE user_id = ? AND game_id = ?`, [
    reelsPosition,
    bet,
    coinValue,
    userId,
    gameId,
  ], function(err) {
    if (err) {
      rejectFn(err.message);
    } else {
      resolveFn();
    }
  });

  return updateGamestatePromise;
}