import React from "react";

const DeleteConfirmationModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) {
    return null;
  }
  return (
    <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg">
        <p className="text-lg font-semibold">
          Are you sure you want to delete this item?
        </p>
        <div className="mt-4 flex justify-end space-x-3">
          <button
            className="px-4 py-2 bg-primary text-white rounded hover:bg-red-600"
            onClick={onConfirm}
          >
            Yes
          </button>
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={onCancel}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
