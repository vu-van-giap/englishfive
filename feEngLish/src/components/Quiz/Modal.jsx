import React from 'react';

export default function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 8,
        minWidth: 300,
        maxWidth: '90%',
        maxHeight: '90%',
        overflowY: 'auto',
        position: 'relative'
      }} className='w-[570px] h-[480px]'>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'none',
            border: 'none',
            fontSize: 18,
            cursor: 'pointer'
          }}
        >✖</button>
        {children}
      </div>
    </div>
  );
}
