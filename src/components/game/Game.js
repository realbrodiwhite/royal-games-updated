// File path: /royalgames-main/src/features/game/Game.js

import { useContext, useEffect, useRef } from 'react';
import './Game.scss';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { SocketContext } from '../../context/socket';
import * as PIXI from 'pixi.js';
import Reel from '../../slot/Reel';
import SlotGame from '../../slot/SlotGame';
import initControls from '../../slot/initControls';
import gsap from 'gsap';

const Game = (props) => {
  // Reference to the DOM element that will contain the game
  const elRef = useRef(null);
  // Get route parameters (for game ID)
  const params = useParams();
  // Get socket instance from context
  const socket = useContext(SocketContext);
  // Hook for programmatic navigation
  const navigate = useNavigate();

  useEffect(() => {
    let game;

    // Fetch and execute game script
    axios.get(`../gamescripts/${params.gameId}.js`).then((response) => {
      // Create and execute a new function with the game script
      game = (new Function(`
        const gameId = arguments[0];
        const Game = arguments[1];
        const Reel = arguments[2];
        const initControls = arguments[3];
        const socket = arguments[4];
        const PIXI = arguments[5];
        const gsap = arguments[6];
        const goToLobby = arguments[7];

        ${response.data}
      `))(params.gameId, SlotGame, Reel, initControls, socket, PIXI, gsap, () => { navigate('/'); });
      
      // Remove existing game canvas if it exists
      const gameCanvas = elRef.current.querySelector('canvas');
      if (gameCanvas) {
        gameCanvas.remove();
      }

      // Append new game canvas to the DOM
      elRef.current.appendChild(game.renderer.view);
    });

    // Cleanup function to destroy the game when component unmounts
    return () => {
      if (game) {
        game.destroy();
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <div
      className="Game"
      ref={elRef}
    >
      {/* Game canvas will be inserted here */}
    </div>
  );
}

export default Game;