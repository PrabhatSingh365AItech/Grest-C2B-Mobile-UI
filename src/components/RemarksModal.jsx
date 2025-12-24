import React, { useEffect, useState } from "react";

const RemarksModal = ({ closeModal, submitRemarks, selectedLead }) => {
  const [remarks, setRemarks] = useState("");

  // Initialize remarks with the existing value if present
  useEffect(() => {
    if (selectedLead?.lead?.remarks) {
      setRemarks(selectedLead.lead.remarks);
    }
  }, [selectedLead]);

  const handleSubmit = () => {
    submitRemarks(remarks);
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="relative p-4 mx-auto bg-white rounded shadow-lg modal-container w-96">
        <h2 className="text-lg font-bold">Add Remarks</h2>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          className="w-full p-2 mt-2 border rounded"
          placeholder={`Add remarks for ${selectedLead.lead.name}`}
        ></textarea>
        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={closeModal}
            className="px-4 py-2 text-white bg-gray-500 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-white bg-[#EC2752] rounded"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemarksModal;
