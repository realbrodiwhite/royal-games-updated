// File path: /royalgames-main/src/features/game-list/GameList.js

// Import Link component from react-router-dom for navigation
import { Link } from 'react-router-dom';

// Import component-specific styles
import './GameList.scss';

// Import game logo images
import rockClimberLogo from '../../assets/img/rock-climber-logo.png';
import egyptianTreasuresLogo from '../../assets/img/egyptian-treasures-logo.png';

// Import useSelector hook from react-redux for accessing Redux store state
import { useSelector } from 'react-redux';

// Define the GameList component
const GameList = (props) => {

  // Use Redux selector to get the loggedIn state from the lobby slice
  const loggedIn = useSelector((state) => state.lobby.loggedIn);

  return (
    <div className="GameList">
      {/* Main list container, hidden when user is not logged in */}
      <div className={`list ${!loggedIn ? 'd-none' : ''}`}>
        {/* Egyptian Treasures game item */}
        <div className="game" style={{position: 'relative'}}>
          <img 
            className="logo" 
            src={egyptianTreasuresLogo} 
            alt="Egyptian Treasures Slots Logo - Royal Games Social Casino"
          />
          
          <span>Egyptian Treasures</span>

          {/* Link to the Egyptian Treasures game */}
          <Link to="play/egyptian-treasures" className="btn-play">
            Play
          </Link>
        </div>

        {/* Rock Climber game item */}
        <div className="game">
          <img 
            className="logo" 
            src={rockClimberLogo} 
            alt="Rock Climber Slots Logo - Royal Games Social Casino"
          />
          
          <span>Rock Climber</span>

          {/* Link to the Rock Climber game */}
          <Link to="play/rock-climber" className="btn-play">
            Play
          </Link>
        </div>
      </div>
    </div>
  );
}

export default GameList;