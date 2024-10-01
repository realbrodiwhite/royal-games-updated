import React from 'react';
import './Modal.scss';

const Modal = ({ isVisible, toggleModal, children }) => {
  if (!isVisible) return null;

  return (
    <div className="modal-backdrop" onClick={toggleModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={toggleModal}>X</button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
