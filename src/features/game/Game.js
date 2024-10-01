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
  const elRef = useRef(null);
  const params = useParams();
  const socket = useContext(SocketContext);
  const navigate = useNavigate();

  useEffect(() => {
    let game;

    axios.get(`../gamescripts/${params.gameId}.js`).then((response) => {
      const script = document.createElement('script');
      script.text = response.data;
      document.head.appendChild(script);

      game = window.initGame(params.gameId, SlotGame, Reel, initControls, socket, PIXI, gsap, () => { navigate('/'); });
      document.head.removeChild(script);

      const gameCanvas = elRef.current.querySelector('canvas');

      if (gameCanvas) {
        gameCanvas.remove();
      }

      elRef.current.appendChild(game.renderer.view);
    }).catch((error) => {
      console.error('Error loading game script:', error.message, error.stack);
    });

    return () => {
      if (game) {
        game.destroy();
      }
    };
  }, [params.gameId, navigate, socket]);

  return (
    <div
      className="Game"
      ref={elRef}
    >

    </div>
  );
}

export default Game;