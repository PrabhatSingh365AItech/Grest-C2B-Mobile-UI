import { IoCloudUploadOutline, IoDocumentTextOutline } from "react-icons/io5";
import FileUploadDropzone from "./FileUploadDropZone";

const FileUploadForm = ({
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
          First Name, Last Name, Email, Password, Mobile Number, Store Name,
          Role, City, Address
        </span>
        .
      </p>
      <button
        onClick={handleDownloadSample}
        className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
      >
        <IoDocumentTextOutline size={16} />
        Download Sample CSV
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

export default FileUploadForm;
