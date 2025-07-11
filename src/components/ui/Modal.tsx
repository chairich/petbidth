'use client';

import React from 'react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-6 relative shadow-xl">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="mb-4 text-sm text-gray-700">{children}</div>
        <div className="text-right">
          <button className="px-4 py-2 bg-primary text-white rounded" onClick={onClose}>ปิด</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
