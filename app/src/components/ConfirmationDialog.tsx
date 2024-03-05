import React, { useRef } from 'react';
import { useOnClickOutside } from 'usehooks-ts';

type ConfirmationDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
};

function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
}: ConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(dialogRef, onClose);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div ref={dialogRef} className="bg-base-300 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-white">{title}</h3>
        <p className="mb-6 text-white">{message}</p>
        <div className="flex justify-end gap-4">
          <button className="btn btn-ghost btn-outline" onClick={onClose}>
            {cancelButtonText}
          </button>
          <button className="btn btn-primary" onClick={onConfirm}>
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationDialog;
