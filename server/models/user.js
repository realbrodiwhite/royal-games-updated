const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const db = new sqlite3.Database('./database.db');

const saltRounds = 10;

const createUser = (user, callback) => {
  const { username, email, legalName, birthday, credits, password } = user;
  const hash = bcrypt.hashSync(password, saltRounds);
  db.run(`INSERT INTO users (username, email, legal_name, birthday, credits, password) VALUES (?, ?, ?, ?, ?, ?)`,
    [username, email, legalName, birthday, credits, hash],
    function(err) {
      if (err) {
        console.error('Error creating user:', err.message);
        callback(err);
      } else {
        console.log('User created with ID:', this.lastID);
        callback(null, this.lastID);
      }
    });
};

const getUserByUsername = (username, callback) => {
  db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
    if (err) {
      console.error('Error fetching user by username:', err.message);
      callback(err);
    } else {
      console.log('User fetched by username:', username);
      callback(null, row);
    }
  });
};

const updateUser = (user, callback) => {
  const { id, username, email, legalName, birthday, credits, profilePicture, coverPhoto } = user;
  db.run(`UPDATE users SET username = ?, email = ?, legal_name = ?, birthday = ?, credits = ?, profile_picture = ?, cover_photo = ? WHERE id = ?`,
    [username, email, legalName, birthday, credits, profilePicture, coverPhoto, id],
    function(err) {
      if (err) {
        console.error('Error updating user:', err.message);
        callback(err);
      } else {
        console.log('User updated with ID:', id);
        callback(null);
      }
    });
};

const resetPassword = (id, newPassword, callback) => {
  const hash = bcrypt.hashSync(newPassword, saltRounds);
  db.run(`UPDATE users SET password = ? WHERE id = ?`, [hash, id], function(err) {
    if (err) {
      console.error('Error resetting password:', err.message);
      callback(err);
    } else {
      console.log('Password reset for user ID:', id);
      callback(null);
    }
  });
};

const getUser = (key) => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM accounts WHERE key = ?`, [key], function(err, rows) {
      if (err) {
        reject(err.message);
      } else {
        if (rows.length === 1) {
          db.run(`UPDATE accounts SET last_login = ? WHERE id = ?`, [(new Date()).getTime(), rows[0].id], function(err) {
            if (err) {
              reject(err.message);
            } else {
              resolve(rows[0]);
            }
          });
        } else {
          reject('Invalid key. Cannot get user.');
        }
      }
    });
  });
};

const updateBalance = (userId, value) => {
  return new Promise((resolve, reject) => {
    db.run(`UPDATE accounts SET balance = ? WHERE id = ?`, [value, userId], function(err) {
      if (err) {
        reject(err.message);
      } else {
        resolve();
      }
    });
  });
};

const updateGamestate = (userId, gameId, bet, coinValue, reelsPosition) => {
  return new Promise((resolve, reject) => {
    db.run(`UPDATE gamestates SET reels = ?, bet = ?, coin_value = ? WHERE user_id = ? AND game_id = ?`, [
      reelsPosition,
      bet,
      coinValue,
      userId,
      gameId,
    ], function(err) {
      if (err) {
        reject(err.message);
      } else {
        resolve();
      }
    });
  });
};

module.exports = {
  createUser,
  getUserByUsername,
  updateUser,
  resetPassword,
  getUser,
  updateBalance,
  updateGamestate
};