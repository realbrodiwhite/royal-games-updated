// File path: /royalgames-main/server/index.js

const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const md5 = require('md5');
const { 
  v1: uuidv1,
  v4: uuidv4,
} = require('uuid');
const Server = require('./server');
const rockClimberData = require('./games-data/rock-climber');
const egyptianTreasuresData = require('./games-data/egyptian-treasures');
require('dotenv').config();

// Connect to PostgreSQL database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client', err.stack);
  } else {
    console.log('Connected to the database.');

    // Initialize and start the server
    const server = new Server();
    const io = server.start();

    initIo(io, client);
  }
  release();
});

// Close database connection on process exit
process.on('exit', function() {
  pool.end();
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

    // Handle exchanging USD to platform credits
    socket.on('exchangeUsdToCredits', async (data) => {
      try {
        const user = await getUser(data.key);
        const credits = data.usd * 100; // Assuming 1 USD = 100 credits
        const newBalance = user.balance + credits;
        const sql = `UPDATE accounts SET balance = $1 WHERE id = $2`;
        pool.query(sql, [newBalance, user.id], (err, res) => {
          if (err) {
            console.log(err);
            socket.emit('exchangeUsdToCredits', {
              status: 'error',
              message: 'Exchange failed',
            });
          } else {
            socket.emit('exchangeUsdToCredits', {
              status: 'success',
              message: 'Exchange successful',
              balance: newBalance,
            });
          }
        });
      } catch (err) {
        console.log(err);
      }
    });

    // Handle exchanging platform credits to USD
    socket.on('exchangeCreditsToUsd', async (data) => {
      try {
        const user = await getUser(data.key);
        const usd = data.credits / 100; // Assuming 100 credits = 1 USD
        const newBalance = user.balance - data.credits;
        if (newBalance < 0) {
          socket.emit('exchangeCreditsToUsd', {
            status: 'error',
            message: 'Insufficient credits',
          });
        } else {
          const sql = `UPDATE accounts SET balance = $1 WHERE id = $2`;
          pool.query(sql, [newBalance, user.id], (err, res) => {
            if (err) {
              console.log(err);
              socket.emit('exchangeCreditsToUsd', {
                status: 'error',
                message: 'Exchange failed',
              });
            } else {
              socket.emit('exchangeCreditsToUsd', {
                status: 'success',
                message: 'Exchange successful',
                balance: newBalance,
                usd: usd,
              });
            }
          });
        }
      } catch (err) {
        console.log(err);
      }
    });

    // Handle updating user information
    socket.on('updateUserInfo', async (data) => {
      try {
        const user = await getUser(data.key);
        const sql = `UPDATE accounts SET username = $1, email = $2 WHERE id = $3`;
        pool.query(sql, [data.username, data.email, user.id], (err, res) => {
          if (err) {
            console.log(err);
            socket.emit('updateUserInfo', {
              status: 'error',
              message: 'Updating user information failed',
            });
          } else {
            socket.emit('updateUserInfo', {
              status: 'success',
              message: 'User information updated successfully',
            });
          }
        });
      } catch (err) {
        console.log(err);
      }
    });

    // Handle creating user profile
    socket.on('createUserProfile', async (data) => {
      try {
        const user = await getUser(data.key);
        const sql = `INSERT INTO profiles (user_id, profile_picture, bio) VALUES ($1, $2, $3)`;
        pool.query(sql, [user.id, data.profile_picture, data.bio], (err, res) => {
          if (err) {
            console.log(err);
            socket.emit('createUserProfile', {
              status: 'error',
              message: 'Creating user profile failed',
            });
          } else {
            socket.emit('createUserProfile', {
              status: 'success',
              message: 'User profile created successfully',
            });
          }
        });
      } catch (err) {
        console.log(err);
      }
    });

    // Handle exchanging USD to game credits
    socket.on('exchangeUsdToCredits', async (data) => {
      try {
        const user = await getUser(data.key);
        const credits = data.usd * 100; // Assuming 1 USD = 100 credits
        const newBalance = user.balance + credits;
        const sql = `UPDATE accounts SET balance = $1 WHERE id = $2`;
        pool.query(sql, [newBalance, user.id], (err, res) => {
          if (err) {
            console.log(err);
            socket.emit('exchangeUsdToCredits', {
              status: 'error',
              message: 'Exchange failed',
            });
          } else {
            socket.emit('exchangeUsdToCredits', {
              status: 'success',
              message: 'Exchange successful',
              balance: newBalance,
            });
          }
        });
      } catch (err) {
        console.log(err);
      }
    });

    // Handle exchanging game credits to USD
    socket.on('exchangeCreditsToUsd', async (data) => {
      try {
        const user = await getUser(data.key);
        const usd = data.credits / 100; // Assuming 100 credits = 1 USD
        const newBalance = user.balance - data.credits;
        if (newBalance < 0) {
          socket.emit('exchangeCreditsToUsd', {
            status: 'error',
            message: 'Insufficient credits',
          });
        } else {
          const sql = `UPDATE accounts SET balance = $1 WHERE id = $2`;
          pool.query(sql, [newBalance, user.id], (err, res) => {
            if (err) {
              console.log(err);
              socket.emit('exchangeCreditsToUsd', {
                status: 'error',
                message: 'Exchange failed',
              });
            } else {
              socket.emit('exchangeCreditsToUsd', {
                status: 'success',
                message: 'Exchange successful',
                balance: newBalance,
                usd: usd,
              });
            }
          });
        }
      } catch (err) {
        console.log(err);
      }
    });

    // Handle rejecting friend request
    socket.on('rejectFriendRequest', async (data) => {
      try {
        const user = await getUser(data.key);
        const sql = `DELETE FROM friends WHERE user_id = $1 AND friend_id = $2 AND status = $3`;
        pool.query(sql, [data.friend_id, user.id, 'pending'], (err, res) => {
          if (err) {
            console.log(err);
            socket.emit('rejectFriendRequest', {
              status: 'error',
              message: 'Rejecting friend request failed',
            });
          } else {
            socket.emit('rejectFriendRequest', {
              status: 'success',
              message: 'Friend request rejected successfully',
            });
          }
        });
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
async function createNewUser(username, balance, key, password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO accounts (username, balance, key, password) VALUES ($1, $2, $3, $4)`;
    pool.query(sql, [username, balance, key, hashedPassword], (err, res) => {
      if (err) {
        reject(err.message);
      } else {
        resolve();
      }
    });
  });
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
