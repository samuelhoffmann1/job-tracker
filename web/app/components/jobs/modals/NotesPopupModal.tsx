import React from 'react';
import { FaTimes } from "react-icons/fa";

interface NotesPopupProps {
  notes: string;
  onClose: () => void;
}

const NotesPopupModal: React.FC<NotesPopupProps> = ({ notes, onClose }) => {
  const handleClose = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).id === 'notes-popup-overlay') {
      onClose();
    }
  };

  return (
    <div
      id="notes-popup-overlay"
      className="fixed inset-0 bg-black/70 flex items-start md:items-center justify-center z-50 p-2 md:p-4 font-mono overflow-y-auto"
      onClick={handleClose}
    >
      <div className="bg-gray-900 border border-gray-700 w-full max-w-lg overflow-auto max-h-[95vh] mt-4 md:mt-0 shadow-lg rounded-sm">
        <div className="px-4 md:px-6 py-3 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-900 z-10">
          <h2 className="text-lg md:text-xl text-gray-200">
            <span className="text-gray-500">$</span> view-notes
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 p-1.5" // Increased tap target
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        <div className="py-4 md:py-6 px-4 md:px-6">
          <pre className="whitespace-pre-wrap text-gray-300 font-mono text-sm md:text-base">
            {notes}
          </pre>
        </div>

        <div className="flex justify-end px-4 md:px-6 py-3 border-t border-gray-700 sticky bottom-0 bg-gray-900 z-10">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-gray-800 text-gray-300 border border-gray-700 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotesPopupModal;