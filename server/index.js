const sqlite3 = require('sqlite3').verbose();
const { v1: uuidv1 } = require('uuid');
const express = require('express');
const http = require('http');
const SocketIo = require('socket.io');
const userRoutes = require('./routes/user');
const rockClimberData = require('./games-data/rock-climber');
const egyptianTreasuresData = require('./games-data/egyptian-treasures');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Replace secret key
const { createUser, getUser, updateBalance, updateGamestate } = require('./models/user');

const app = express();
const server = http.createServer(app);
const io = new SocketIo.Server(server, {
  cors: {
    origin: "*",
  },
});

let db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the database.');
  }
});

process.on('exit', function() {
  db.close((err) => {
    if (err) {
      console.error('Error closing the database connection:', err.message, err.stack);
    } else {
      console.log('Database connection closed.');
    }
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/user', userRoutes);

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.use((req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/api/credit-exchange', async (req, res) => {
  const { amount, exchangeType, paymentMethodId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // amount in cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
    });

    // Handle the exchange logic here
    // ...

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error during credit exchange:', error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('login', async (data) => {
    if (data.key === null) {
      // a new user is trying to login
      const key = uuidv1();
      const username = 'Guest';
      const balance = 10000.00;
      try {
        await createUser({ username, balance, key }, (err, userId) => {
          if (err) {
            console.error('Error creating user:', err.message, err.stack);
            return;
          }
          console.log('User created with ID:', userId);
        });

        socket.emit('login', {
          status: 'logged-in',
          key,
          username,
          balance,
        });
      } catch (err) {
        console.error('Error during new user login:', err.message, err.stack);
      }
    } else if (data.key) {
      // a user is trying to login with local key
      try {
        const user = await getUser(data.key);

        socket.emit('login', {
          status: 'logged-in',
          key: data.key,
          username: user.username,
          balance: user.balance,
        });
      } catch (err) {
        console.error('Error during user login with key:', err.message, err.stack);
      }
    }
  });

  socket.on('balance', async (data) => {
    try {
      const account = await getUser(data.key);

      socket.emit('balance', account.balance);
    } catch (err) {
      console.error('Error fetching balance:', err.message, err.stack);
    }
  });

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
      console.error('Error fetching gamestate:', err.message, err.stack);
    }
  });

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
      console.error('Error processing bet:', err.message, err.stack);
    }
  });
});

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

const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});