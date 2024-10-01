import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import './Header.scss';
import { faCog, faCrown, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSelector } from 'react-redux';
import { SocketContext } from '../../context/socket';
import store from '../../store';
import lobbySlice from '../../lobbySlice';
import CreditExchangeWrapper from '../credit-exchange/CreditExchange';

const Header = () => {
  const loggedIn = useSelector((state) => state.lobby.loggedIn);
  const username = useSelector((state) => state.lobby.username);
  const balance = useSelector((state) => state.lobby.balance);

  const socket = useContext(SocketContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showCreditExchange, setShowCreditExchange] = useState(false);

  useEffect(() => {
    socket.emit('balance', {
      key: localStorage.getItem('key'),
    });

    socket.on('balance', (balance) => {
      store.dispatch(lobbySlice.actions.updateBalance(balance));
    });
  }, [socket]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleCreditExchange = () => {
    setShowCreditExchange(!showCreditExchange);
  };

  return (
    <header className="Header">
      <div className="brand">
        <Link to="/">
          <FontAwesomeIcon icon={faCrown} size="2x" className="logo"></FontAwesomeIcon>
          <span className="name">Sloticon</span>
        </Link>
      </div>

      <div className={`menu ${!loggedIn ? 'd-none' : ''}`}>
        <div className="account">
          <button className="btn-toggle-account-menu" onClick={toggleMenu}>
            <FontAwesomeIcon icon={faUserCircle} size="2x"></FontAwesomeIcon>
            <span>{username}</span>
          </button>
          {menuOpen && (
            <div className="account-menu">
              <ul>
                <li><Link to="/register">Register</Link></li>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/profile">Profile</Link></li>
                <li><Link to="/reset-password">Reset Password</Link></li>
              </ul>
            </div>
          )}
        </div>

        <button className="btn-settings">
          <FontAwesomeIcon icon={faCog} size="2x"></FontAwesomeIcon>
        </button>
      </div>

      <div className={`balance ${!loggedIn ? 'd-none' : ''}`} onClick={toggleCreditExchange}>
        <span className="label">Balance</span>
        <span className="value">€{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>

      {showCreditExchange && <CreditExchangeWrapper onClose={toggleCreditExchange} />}
    </header>
  );
}

export default Header;