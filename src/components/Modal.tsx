import { X } from 'lucide-react';
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  hideHeader?: boolean;
  showCloseButton?: boolean;
  maxWidth?: string;
  className?: string;
  contentClassName?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  hideHeader = false,
  showCloseButton = true,
  maxWidth,
  className,
  contentClassName,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div
        className={`bg-white rounded-xl shadow-xl w-full ${
          maxWidth || "max-w-2xl"
        } ${className || ""}`}
      >
        {!hideHeader && (
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-900">
              {title || ""}
            </h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
        <div className={contentClassName || "p-6 max-h-[60vh] overflow-y-auto"}>
          {children}
        </div>
      </div>
    </div>
  );
}
