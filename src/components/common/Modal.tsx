'use client';

import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
  show: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ show, onClose, children }: ModalProps) {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const modalContent = show ? (
    <div
      className="modal-backdrop show"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1050,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        className="bg-dark p-4 rounded shadow"
        style={{ width: '100%', maxWidth: '500px', position: 'relative' }}
      >
        <button
          className="btn-close btn-close-white position-absolute top-0 end-0 m-3"
          onClick={onClose}
        />
        {children}
      </div>
    </div>
  ) : null;

  if (isBrowser) {
    return ReactDOM.createPortal(modalContent, document.body);
  } else {
    return null;
  }
}
