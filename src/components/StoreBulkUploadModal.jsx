import axios from "axios";
import UploadSpinner from "./UploadSpinner";
import { IoCloudUploadOutline, IoDocumentTextOutline } from "react-icons/io5";
import { useBulkUpload } from "../hooks/useBulkUpload";
import FileUploadDropzone from "./FileUploadDropZone";
import { generateExcelFile } from "../utils/excelHelper";

const StoreBulkUploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const {
    file,
    isUploading,
    setIsUploading,
    uploadResult,
    setUploadResult,
    error,
    setError,
    previewData,
    previewHeaders,
    handleFileChange,
    resetState,
  } = useBulkUpload(isOpen);

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setIsUploading(true);
    setError("");
    const token = sessionStorage.getItem("authToken");
    const formData = new FormData();
    formData.append("file", file);

    const config = {
      method: "post",
      url: `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/store/uploadStores`,
      headers: {
        Authorization: token,
        "Content-Type": "multipart/form-data",
      },
      data: formData,
    };

    try {
      const response = await axios.request(config);
      setUploadResult(response.data);
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "An unexpected error occurred during upload.";
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadSample = () => {
    const sampleData = [
      {
        storeName: "Example Store",
        companyCode: "COMP001",
        region: "North",
        email: "store@example.com",
        contactNumber: "9876543210",
        address: "123 Main Street, City",
      },
    ];

    generateExcelFile(sampleData, "store-upload-sample");
  };

  const handleDownloadErrors = () => {
    if (uploadResult?.errorDetails && uploadResult.errorDetails.length > 0) {
      const errorData = uploadResult.errorDetails.map((err) => ({
        Row: err.row,
        Error: err.message,
        ...err.data,
      }));

      generateExcelFile(errorData, "store-upload-errors");
    }
  };

  if (!isOpen) {
    return null;
  }

  let content;
  if (isUploading) {
    content = <UploadSpinner />;
  } else if (uploadResult) {
    content = (
      <StoreUploadSummary
        uploadResult={uploadResult}
        onReset={resetState}
        onClose={onClose}
        onDownloadErrors={handleDownloadErrors}
      />
    );
  } else {
    content = (
      <StoreFileUploadForm
        file={file}
        error={error}
        previewData={previewData}
        previewHeaders={previewHeaders}
        handleFileChange={handleFileChange}
        handleUpload={handleUpload}
        handleDownloadSample={handleDownloadSample}
        isUploading={isUploading}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div
        style={{ boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px" }}
        className="bg-white rounded-lg p-6 md:p-8 w-full max-w-4xl relative transform transition-all"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-2xl font-bold text-gray-500 hover:text-gray-900"
        >
          ×
        </button>
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 border-b pb-4">
          Bulk Store Upload
        </h2>

        {content}
      </div>
    </div>
  );
};

export default StoreBulkUploadModal;

const StoreFileUploadForm = ({
  file,
  error,
  previewData,
  previewHeaders,
  handleFileChange,
  handleUpload,
  handleDownloadSample,
  isUploading,
}) => (
  <>
    <div className="mb-6 p-4 border border-dashed rounded-lg bg-gray-50">
      <p className="text-sm text-gray-600 mb-2">
        Download the sample template to ensure your data is in the correct
        format. Mandatory fields are:{" "}
        <span className="font-semibold">
          storeName, companyCode, region, contactNumber, address
        </span>
        . Optional: email.
      </p>
      <button
        onClick={handleDownloadSample}
        className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
      >
        <IoDocumentTextOutline size={16} />
        Download Sample Excel
      </button>
    </div>

    <FileUploadDropzone
      file={file}
      error={error}
      previewData={previewData}
      previewHeaders={previewHeaders}
      handleFileChange={handleFileChange}
    />

    <div className="mt-8 flex justify-end">
      <button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className="flex items-center gap-2 font-medium text-sm text-white px-6 py-2.5 rounded bg-primary disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        <IoCloudUploadOutline size={18} />
        Upload File
      </button>
    </div>
  </>
);

const StoreUploadSummary = ({
  uploadResult,
  onReset,
  onClose,
  onDownloadErrors,
}) => {
  const stats = [
    {
      label: "Inserted",
      value: uploadResult.inserted || 0,
      color: "green",
    },
    {
      label: "Updated",
      value: uploadResult.updated || 0,
      color: "blue",
    },
    {
      label: "Errors",
      value: uploadResult.errors || 0,
      color: "red",
    },
  ];

  return (
    <>
      <h3 className="text-xl font-semibold text-gray-700 mb-4">
        Upload Summary
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center mb-6">
        {stats.map(({ label, value, color }) => (
          <div key={label} className={`p-4 bg-${color}-100 rounded-lg`}>
            <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
            <p className={`text-sm font-medium text-${color}-500`}>{label}</p>
          </div>
        ))}
      </div>

      {uploadResult.errors > 0 && uploadResult.errorDetails && (
        <div className="flex flex-col items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-gray-700 mb-3 text-center">
            Some records failed. Download the error file, fix them, and
            re-upload.
          </p>
          <button
            onClick={onDownloadErrors}
            className="flex items-center gap-2 text-sm text-white px-4 py-2 rounded bg-primary hover:bg-opacity-90"
          >
            <IoDocumentTextOutline size={18} />
            Download Error Details
          </button>
        </div>
      )}

      <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3">
        <button
          onClick={onReset}
          className="text-sm text-gray-700 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          Upload Another File
        </button>
        <button
          onClick={onClose}
          className="text-sm text-white px-4 py-2 rounded bg-primary hover:bg-opacity-90"
        >
          Close
        </button>
      </div>
    </>
  );
};
