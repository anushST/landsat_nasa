// Modal.js
import React from 'react';

const Modal = ({ isOpen, closeModal, children }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (event) => {
    document.body.style.overflow = 'auto';
    closeModal();
  };
  
  const handleContentClick = (event) => {
    document.body.style.overflow = 'hidden';

    event.stopPropagation();
  };
  return (
    <div 
      className="fixed z-30 inset-0 overflow-y-auto bg-black bg-opacity-75" 
      onClick={handleOverlayClick}
      tabIndex={-1} // Add tabIndex
    >
      
       <div onClick={handleContentClick} className='max-w-screen-lg m-auto'>
        {children}
       </div>
    </div>
  );
  
};

export default Modal;
