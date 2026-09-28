import { IoCloudUploadOutline } from "react-icons/io5";

const getRowClass = (index) => (index % 2 === 0 ? "bg-gray-100" : "bg-white");

const FileUploadDropzone = ({
  file,
  error,
  previewData,
  previewHeaders,
  handleFileChange,
}) => (
  <>
    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-white hover:border-primary transition-colors">
      <IoCloudUploadOutline className="text-gray-400" size={50} />
      <label
        htmlFor="file-upload"
        className="mt-2 cursor-pointer font-medium text-primary hover:text-primary-dark"
      >
        <span>Select a .csv or .xlsx file</span>
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          className="sr-only"
          onChange={handleFileChange}
          accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        />
      </label>
      {file && <p className="mt-2 text-sm text-gray-500">{file.name}</p>}
    </div>

    {error && <p className="mt-4 text-sm text-red-600 text-center">{error}</p>}

    {previewData.length > 0 && (
      <div className="mt-6">
        <h4 className="font-semibold text-gray-700 mb-2">
          File Preview (Top 5 rows)
        </h4>
        <div className="overflow-y-auto border border-primary rounded-lg max-h-40">
          <table className="w-full text-sm text-left">
            <thead className="bg-primary text-white sticky top-0">
              <tr>
                {previewHeaders.map((header, index) => (
                  <th key={index} className="p-2 md:p-3 font-medium">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {previewData.map((row, rowIndex) => (
                <tr key={rowIndex} className={getRowClass(rowIndex)}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="p-2 md:p-3 text-gray-700 truncate max-w-xs"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </>
);

export default FileUploadDropzone;
