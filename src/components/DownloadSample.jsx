import React from "react";
import { saveAs } from "file-saver";

const DownloadSample = () => {
  const handleDownload = () => {
    const sampleFilePath = "sample-file.xlsx";
    saveAs(sampleFilePath, "sample-file.xlsx");
  };
  return (
    <div>
      <button
        onClick={handleDownload}
        className="p-1 sm:p-3 bg-white text-base sm:text-xl rounded-lg text-primary font-semibold  focus:outline-none"
      >
        Download Sample File
      </button>
    </div>
  );
};

export default DownloadSample;
