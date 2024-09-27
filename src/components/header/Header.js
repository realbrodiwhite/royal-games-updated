// File path: /royalgames-main/src/features/header/Header.js

// Import Font Awesome icons and component
import { faCog, faCrown, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Import component-specific styles
import './Header.scss';

// Import Redux hooks and React hooks
import { useSelector } from 'react-redux';
import { useEffect, useContext } from 'react';

// Import socket context, Redux store, and lobby slice
import { SocketContext } from '../../context/socket';
import store from '../../store';
import lobbySlice from '../../lobbySlice';

// Define the Header component
const Header = (props) => {
  // Use Redux selectors to access lobby state
  const loggedIn = useSelector((state) => state.lobby.loggedIn);
  const username = useSelector((state) => state.lobby.username);
  const balance = useSelector((state) => state.lobby.balance);

  // Get socket instance from context
  const socket = useContext(SocketContext);

  // Set up effect for balance updates
  useEffect(() => {
    // Request balance update from server
    socket.emit('balance', {
      key: localStorage.getItem('key'),
    });

    // Listen for balance updates from server
    socket.on('balance', (balance) => {
      // Update balance in Redux store
      store.dispatch(lobbySlice.actions.updateBalance(balance));
    });
  }, [socket]); // Re-run effect if socket changes

  return (
    <div className="Header">
      {/* Brand section */}
      <div className="brand">
        <FontAwesomeIcon
          icon={faCrown}
          size="2x"
          className="logo"
        ></FontAwesomeIcon>
        <span className="name">Royal Games</span>
      </div>

      {/* Menu section - only visible when logged in */}
      <div className={`menu ${!loggedIn ? "d-none" : ""}`}>
        <div className="account">
          <button className="btn-toggle-account-menu">
            <FontAwesomeIcon icon={faUserCircle} size="2x"></FontAwesomeIcon>
            <span>{username}</span>
          </button>
        </div>

        <button className="btn-settings">
          <FontAwesomeIcon icon={faCog} size="2x"></FontAwesomeIcon>
        </button>
      </div>

      {/* Balance display - only visible when logged in */}
      <div className={`balance ${!loggedIn ? "d-none" : ""}`}>
        <span className="label">Gaming Credits</span>
        <span className="value">
          {balance.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>
    </div>
  );
}

export default Header;