import { useState } from 'react';

// Create a promise-based confirmation dialog
let resolveCallback;

const ConfirmDialog = ({ isOpen, onClose, title, message, confirmText = "Confirm", cancelText = "Cancel", confirmButtonColor = "bg-red-500", confirmButtonHoverColor = "hover:bg-red-600" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white border-4 border-black max-w-md w-full drop-shadow-[12px_12px_0px_rgba(0,0,0,1)] animate-dialog-enter">
        {/* Header */}
        <div className="bg-[#F4A460] border-b-4 border-black p-4">
          <h2 className="text-2xl font-bold text-black">{title}</h2>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <p className="text-gray-800 text-lg font-medium mb-6">
            {message}
          </p>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                onClose(true);
              }}
              className={`flex-1 py-3 px-4 ${confirmButtonColor} text-white font-bold ${confirmButtonHoverColor} transition-colors border-3 border-black drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:drop-shadow-[6px_6px_0px_rgba(0,0,0,1)]`}
            >
              {confirmText}
            </button>
            <button
              onClick={() => {
                onClose(false);
              }}
              className="flex-1 py-3 px-4 bg-white text-gray-800 font-bold hover:bg-gray-100 transition-colors border-3 border-black drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:drop-shadow-[6px_6px_0px_rgba(0,0,0,1)]"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook for using confirmation dialog
export const useConfirmDialog = () => {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    confirmButtonColor: 'bg-red-500',
    confirmButtonHoverColor: 'hover:bg-red-600'
  });

  const confirm = ({ title, message, confirmText, cancelText, confirmButtonColor, confirmButtonHoverColor }) => {
    setDialogState({
      isOpen: true,
      title: title || 'Confirm Action',
      message: message || 'Are you sure?',
      confirmText: confirmText || 'Confirm',
      cancelText: cancelText || 'Cancel',
      confirmButtonColor: confirmButtonColor || 'bg-red-500',
      confirmButtonHoverColor: confirmButtonHoverColor || 'hover:bg-red-600'
    });

    return new Promise((resolve) => {
      resolveCallback = resolve;
    });
  };

  const handleClose = (result) => {
    setDialogState({ ...dialogState, isOpen: false });
    if (resolveCallback) {
      resolveCallback(result);
      resolveCallback = null;
    }
  };

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      isOpen={dialogState.isOpen}
      onClose={handleClose}
      title={dialogState.title}
      message={dialogState.message}
      confirmText={dialogState.confirmText}
      cancelText={dialogState.cancelText}
      confirmButtonColor={dialogState.confirmButtonColor}
      confirmButtonHoverColor={dialogState.confirmButtonHoverColor}
    />
  );

  return { confirm, ConfirmDialogComponent };
};

export default ConfirmDialog;
