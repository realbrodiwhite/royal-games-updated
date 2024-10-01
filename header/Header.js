import { faCog, faCrown, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Header.scss';
import { useSelector } from 'react-redux';
import { useState, useEffect, useContext } from 'react';
import { SocketContext } from '../../context/socket';
import store from '../../store';
import lobbySlice from '../../lobbySlice';
import Modal from '../modal/Modal';
import Login from '../login/Login';
import Register from '../register/Register';

const Header = (props) => {
  const loggedIn = useSelector((state) => state.lobby.loggedIn);
  const username = useSelector((state) => state.lobby.username);
  const balance = useSelector((state) => state.lobby.balance);

  const [isModalVisible, setModalVisible] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const socket = useContext(SocketContext);

  useEffect(() => {
    if (loggedIn) {
      socket.emit('balance', {
        key: localStorage.getItem('key'),
      });

      socket.on('balance', (balance) => {
        store.dispatch(lobbySlice.actions.updateBalance(balance));
      });
    }
  }, [socket, loggedIn]);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="Header">
      <div className="brand">
        <FontAwesomeIcon icon={ faCrown } size="2x" className="logo"></FontAwesomeIcon>
        <span className="name">Royal Games</span>
      </div>

      <div className={`menu ${!loggedIn ? "d-none" : ""}`}>
        <div className="account">
          <button className="btn-toggle-account-menu" onClick={toggleModal}>
            <FontAwesomeIcon icon={ faUserCircle } size="2x"></FontAwesomeIcon>
            <span>{username}</span>
          </button>
        </div>

        <button className="btn-settings">
          <FontAwesomeIcon icon={ faCog } size="2x"></FontAwesomeIcon>
        </button>
      </div>

      <div className={`balance ${!loggedIn ? "d-none" : ""}`}>
        <span className="label">Gaming Credits</span>
        <span className="value">
          {balance.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>

      <Modal isVisible={isModalVisible} toggleModal={toggleModal}>
        {isLogin ? <Login toggleForm={toggleForm} /> : <Register toggleForm={toggleForm} />}
      </Modal>
    </div>
  );
}

export default Header;