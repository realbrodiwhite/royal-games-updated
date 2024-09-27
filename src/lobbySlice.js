// src/redux/slices/lobbySlice.js

import { createSlice } from "@reduxjs/toolkit";

// Create a new Redux slice called "lobby"
const lobbySlice = createSlice({
  // Name of the slice
  name: 'lobby',
  
  // Initial state of the slice
  initialState: {
    // Initially, the user is not logged in
    loggedIn: false,
    
    // No username is set initially
    username: null,
    
    // Balance is set to -1 initially (unknown)
    balance: -1,
  },
  
  // Reducers for the slice
  reducers: {
    // Reducer to update the login state
    updateLoginState: (state, action) => {
      // Update the loggedIn state based on the action payload
      state.loggedIn = action.payload.status === 'logged-in';
      
      // Update the username state with the provided value
      state.username = action.payload.username;
    },
    
    // Reducer to update the balance
    updateBalance: (state, action) => {
      // Update the balance state with the provided value
      state.balance = action.payload;
    },
  },
});

// Export the lobby slice as the default export
export default lobbySlice;