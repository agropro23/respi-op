import React from 'react';

const ModalHeader = ({ title, onClose }) => {
  return (
    <div className="modal-header">
      <h5 className="modal-title">{title}</h5>
      {onClose && (
        <button
          type="button"
          className="btn-close"
          onClick={onClose}
          aria-label="Close"
        ></button>
      )}
    </div>
  );
};

export default ModalHeader; 