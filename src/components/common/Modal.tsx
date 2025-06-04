// components/Modal.tsx
import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center">
      <div className="bg-[rgb(var(--background))] rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-neutral-400 hover:text-white"
        >
          ✕
        </button>
        {title && (
          <h2 className="text-lg font-semibold text-warning mb-3">{title}</h2>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;
