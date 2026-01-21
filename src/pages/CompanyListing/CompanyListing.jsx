import React, { useState } from "react";
import AdminNavbar from "../../components/Admin_Navbar";
import SideMenu from "../../components/SideMenu";
import { AiOutlineFile } from "react-icons/ai";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

// Extracted complex upload logic to a helper function
const uploadDocumentsToS3 = async (attachedFiles, userToken) => {
  const uploadedDocuments = [];

  if (attachedFiles.length > 0) {
    toast.loading("Uploading documents...");

    for (const file of attachedFiles) {
      try {
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;

        const presignedUrlResponse = await axios.get(
          `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/s3/get-presigned-url`,
          {
            params: {
              fileName: fileName,
              fileType: file.type,
            },
            headers: { Authorization: userToken },
          }
        );

        if (presignedUrlResponse?.data?.url) {
          const presignedUrl = presignedUrlResponse.data.url;

          await axios.put(presignedUrl, file, {
            headers: {
              "Content-Type": file.type,
            },
            transformRequest: [
              (data, headers) => {
                delete headers.Authorization;
                return data;
              },
            ],
          });

          const s3Url = presignedUrl.split("?")[0];
          uploadedDocuments.push({
            fileName: file.name,
            fileUrl: s3Url,
            fileType: file.type,
            uploadedAt: new Date().toISOString(),
          });
        }
      } catch (uploadError) {
        console.error("File upload error:", uploadError);
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    toast.dismiss();
  }
  return uploadedDocuments;
};

const FormInput = ({ label, value, onChange, required = false }) => (
  <div className="flex flex-col w-[70%] gap-2">
    <span className="font-medium text-xl">
      {label}
      {required && "*"}
    </span>
    <input
      className="border-2 px-2 py-2 rounded-lg outline-none"
      type="text"
      value={value}
      required={required}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const CompanyListing = () => {
  const [sideMenu, setsideMenu] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [remarks, setRemarks] = useState("");

  const [showPrice, setShowPrice] = useState(false);
  const [maskInfo, setMaskInfo] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedCompanyCode, setGeneratedCompanyCode] = useState("");
  const navigate = useNavigate();
  const handleFileUpload = (e) => {
    const files = e.target.files;
    setAttachedFiles((prevFiles) => [...prevFiles, ...Array.from(files)]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userToken = sessionStorage.getItem("authToken");

    try {
      // Step 1: Upload files to S3 using presigned URLs
      const uploadedDocuments = await uploadDocumentsToS3(
        attachedFiles,
        userToken
      );

      // Step 2: Create company with uploaded file URLs
      const payload = {
        name: companyName,
        contactNumber: contactNumber,
        address: address,
        gstNumber: gstNumber.toUpperCase(),
        panNumber: panNumber.toUpperCase(),
        remarks: remarks,
        showPrice: showPrice, // Added to payload
        maskInfo: maskInfo, // Added to payload
        attachedDocuments: uploadedDocuments,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/company/create`,
        payload,
        {
          headers: {
            Authorization: userToken,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("res is ", response);
      toast.success("Company Added Successfully!");

      if (response.data.result && response.data.result.companyCode) {
        setGeneratedCompanyCode(response.data.result.companyCode);
        setShowSuccess(true);
      }

      setTimeout(() => {
        navigate("/companylistingdetails");
      }, 3000);
    } catch (err) {
      console.log(err);
      if (err.response && err.response.data && err.response.data.errors) {
        err.response.data.errors.forEach((error) => toast.error(error));
      } else {
        toast.error(err.response?.data?.message || "Failed to create company");
      }
    }
  };

  const formData = {
    companyName,
    contactNumber,
    address,
    gstNumber,
    panNumber,
    remarks,
    showPrice,
    maskInfo,
    attachedFiles,
  };

  const setters = {
    setCompanyName,
    setContactNumber,
    setAddress,
    setGstNumber,
    setPanNumber,
    setRemarks,
    setShowPrice,
    setMaskInfo,
  };

  return (
    <div>
      <div className="navbar">
        <AdminNavbar setsideMenu={setsideMenu} sideMenu={sideMenu} />
        <SideMenu setsideMenu={setsideMenu} sideMenu={sideMenu} />
      </div>

      <div
        style={{
          boxShadow:
            "rgba(0, 0, 0, 0.3) 0px 0px 10px, rgba(0, 0, 0, 0.1) 0px 5px 12px",
        }}
        className="items-center bg-white max-w-[900px] flex py-8 mx-auto mt-4 justify-center flex-col"
      >
        <div className="flex flex-col  w-[900px]">
          <div className="mb-6 flex flex-col gap-2 border-b-2 mr-10 pb-2 ml-10">
            <p className="text-4xl font-bold">Company Listing</p>
            <p className="text-lg">All fields marked with * are required</p>
          </div>
          <div className="flex flex-wrap gap-2 ml-10 mb-10">
            <Link
              to="/companylistingdetails"
              className="font-medium text-sm text-white p-3 rounded bg-primary"
            >
              View Detail
            </Link>
          </div>

          {showSuccess && generatedCompanyCode && (
            <div className="ml-10 mr-10 mb-6 p-4 bg-green-100 border-2 border-green-500 rounded-lg">
              <p className="text-green-800 font-semibold">
                ✓ Company Created Successfully!
              </p>
              <p className="text-green-700 mt-2">
                Generated Company Code:{" "}
                <span className="font-bold">{generatedCompanyCode}</span>
              </p>
              <p className="text-green-600 text-sm mt-1">
                Redirecting to company details...
              </p>
            </div>
          )}

          <CompanyListingForm
            formData={formData}
            setters={setters}
            handleSubmit={handleSubmit}
            handleFileUpload={handleFileUpload}
          />
        </div>
      </div>
    </div>
  );
};

export default CompanyListing;

// [FIX 2: BRAIN OVERLOAD]
// Extracted the UI Form into a sub-component to reduce line count of main component
const CompanyListingForm = ({
  formData,
  setters,
  handleSubmit,
  handleFileUpload,
}) => {
  const {
    companyName,
    address,
    contactNumber,
    gstNumber,
    panNumber,
    remarks,
    showPrice,
    maskInfo,
    attachedFiles,
  } = formData;

  const {
    setCompanyName,
    setAddress,
    setContactNumber,
    setGstNumber,
    setPanNumber,
    setRemarks,
    setShowPrice,
    setMaskInfo,
  } = setters;

  return (
    <form onSubmit={handleSubmit} className="ml-10 flex flex-col gap-4">
      <FormInput
        label="Name"
        value={companyName}
        onChange={setCompanyName}
        required
      />
      <FormInput label="Address" value={address} onChange={setAddress} />
      <FormInput
        label="Contact Number"
        value={contactNumber}
        onChange={setContactNumber}
      />
      <FormInput label="GST Number" value={gstNumber} onChange={setGstNumber} />
      <FormInput label="PAN Number" value={panNumber} onChange={setPanNumber} />
      <FormInput label="Remarks" value={remarks} onChange={setRemarks} />

      <div className="flex flex-col w-[70%] gap-2">
        <span className="font-medium text-xl">Show Price</span>
        <select
          className="border-2 px-2 py-2 rounded-lg outline-none bg-white"
          value={showPrice.toString()}
          onChange={(e) => setShowPrice(e.target.value === "true")}
        >
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      </div>

      <div className="flex flex-col w-[70%] gap-2">
        <span className="font-medium text-xl">Mask Info</span>
        <select
          className="border-2 px-2 py-2 rounded-lg outline-none bg-white"
          value={maskInfo.toString()}
          onChange={(e) => setMaskInfo(e.target.value === "true")}
        >
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      </div>

      <div className="flex flex-col w-[70%] gap-2">
        <span className="font-medium text-xl">Attach Documents</span>
        <input
          className=" py-2 rounded-lg w-[250px] outline-none"
          onChange={handleFileUpload}
          type="file"
          multiple
        />
      </div>

      <div className="flex flex-wrap w-[90%] gap-2">
        {attachedFiles.length > 0 &&
          attachedFiles.map((file, index) => (
            <div key={index} className="flex flex-col items-center">
              <AiOutlineFile size={80} />
              <p>{file.name}</p>
            </div>
          ))}
      </div>

      <div className="mt-8">
        <button className="font-medium text-sm text-white p-3 rounded bg-primary">
          Submit Form
        </button>
      </div>
    </form>
  );
};
