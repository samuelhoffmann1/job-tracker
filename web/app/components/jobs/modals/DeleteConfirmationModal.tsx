import React from 'react';

interface DeleteConfirmationProps {
  id: number;
  title: string;
  company: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationProps> = ({
  id, title, company, onConfirm, onCancel
}) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 font-mono">
      <div className="bg-gray-900 border border-gray-700 w-full max-w-md overflow-auto max-h-[95vh] shadow-lg rounded-sm">
        <div className="px-4 md:px-6 py-3 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-lg md:text-xl text-amber-500">
            <span className="text-gray-400">$</span> confirm delete
          </h2>
        </div>

        <div className="py-4 md:py-6 px-4 md:px-6">
          <div className="text-red-400 mb-4">WARNING: This operation cannot be undone.</div>
          <div className="text-gray-300 mb-6">
            <span className="text-gray-500">$</span> rm -f /jobs/{id}
            <span className="animate-blink ml-1">_</span>
          </div>
          <div className="mb-6 text-gray-300">
            Delete job "<span className="text-white">{title}</span>" at <span className="text-white">{company}</span>?
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2.5 bg-transparent text-gray-300 border border-gray-600 hover:bg-gray-800 transition-colors order-2 sm:order-1"
            >
              CANCEL
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2.5 bg-transparent text-red-400 border border-red-900 hover:bg-red-900/30 transition-colors order-1 sm:order-2"
            >
              CONFIRM DELETE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;