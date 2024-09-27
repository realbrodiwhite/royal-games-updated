// File path: /royalgames-main/src/context/socket.js

import io from "socket.io-client";
import React from 'react';
import store from '../store';
import lobbySlice from "../lobbySlice";

// Create a Socket.IO connection to the server
// production development connection
export const socket = io.connect('https://royalgames.vercel.app');
// local development connection
// export const socket = io.connect('http://localhost:3001');

// Create a React context for the socket
export const SocketContext = React.createContext();

// Event handler for when the socket connects
socket.on('connect', () => {
  // Attempt to log in using the key stored in localStorage
  socket.emit('login', {
    key: localStorage.getItem('key'),
  });

  // Set a timeout for login attempt
  const waitForLoginTimeout = setTimeout(() => {
    // If login doesn't succeed within 5 seconds, assume the key is invalid
    localStorage.removeItem('key');

    // Attempt to log in again without a key
    socket.emit('login', {
      key: localStorage.getItem('key'),
    });
  }, 5000);

  // Event handler for login response
  socket.on('login', (data) => {
    // Clear the login timeout as we've received a response
    clearTimeout(waitForLoginTimeout);

    if (data.status === 'logged-in') {
      // Store the new key in localStorage
      localStorage.setItem('key', data.key);

      // Update the Redux store with login state and username
      store.dispatch(lobbySlice.actions.updateLoginState({
        status: data.status,
        username: data.username,
      }));

      // Update the balance in the Redux store
      store.dispatch(lobbySlice.actions.updateBalance(data.balance));
    }
  });
});

// Event handler for when the socket disconnects
socket.on('disconnect', () => {
  // Update the Redux store to reflect logged out state
  store.dispatch(lobbySlice.actions.updateLoginState('logged-out'));

  // Reset the balance to 0
  store.dispatch(lobbySlice.actions.updateBalance(0));
});