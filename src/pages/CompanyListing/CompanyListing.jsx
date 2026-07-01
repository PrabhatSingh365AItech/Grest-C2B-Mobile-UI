import React, { useState } from "react";
import AdminNavbar from "../../components/Admin_Navbar";
import SideMenu from "../../components/SideMenu";
import { AiOutlineFile } from "react-icons/ai";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import EmailConfiguration from "../../components/EmailConfiguration/EmailConfiguration";

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
          },
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
  const sectionTitle = (text) => (
    <span className='font-semibold text-base text-gray-800'>{text}</span>
  )

const validateSlab = (slab, index, allSlabs) => {
  if (Number(slab.maxValue) <= Number(slab.minValue)) {
    toast.error('Max Value must be greater than Min Value in every slab row.');
    return false;
  }
  if (Number(slab.bonusAmount) > Number(slab.maxValue)) {
    toast.error('Bonus Amount cannot exceed the Exact Value for this slab range.');
    return false;
  }
  if (index > 0 && Number(slab.minValue) <= Number(allSlabs[index - 1].maxValue)) {
    toast.error('Slab ranges overlap. Please ensure slabs are contiguous with no gaps.');
    return false;
  }
  return true;
};

const validatePricing = (dynamicPricingEnabled, slabs, effectiveFrom) => {
  if (!dynamicPricingEnabled) {
    return true;
  }
  if (slabs.length === 0) {
    toast.error('Please add at least one pricing slab before saving.');
    return false;
  }
  for (let i = 0; i < slabs.length; i++) {
    if (!validateSlab(slabs[i], i, slabs)) {
      return false;
    }
  }
  if (!effectiveFrom) {
    toast.error('Effective From Date is required');
    return false;
  }
  const selectedDate = new Date(effectiveFrom);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate < today) {
    toast.error('Effective From Date cannot be set in the past.');
    return false;
  }
  return true;
};

const SuccessNotification = ({ show, companyCode }) => {
  if (!show || !companyCode) {
    return null;
  }
  return (
    <div className="ml-10 mr-10 mb-6 p-4 bg-green-100 border-2 border-green-500 rounded-lg">
      <p className="text-green-800 font-semibold">
        ✓ Company Created Successfully!
      </p>
      <p className="text-green-700 mt-2">
        Generated Company Code:{" "}
        <span className="font-bold">{companyCode}</span>
      </p>
      <p className="text-green-600 text-sm mt-1">
        Redirecting to company details...
      </p>
    </div>
  );
};

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
  const [emailConfiguration, setEmailConfiguration] = useState({
    enabled: false,
    recipients: [],
    notificationTypes: ["paymentReceipt"],
  });

  const [dynamicPricingEnabled, setDynamicPricingEnabled] = useState(false);
  const [slabs, setSlabs] = useState([
    { minValue: 0, maxValue: 2999, bonusAmount: 0 },
    { minValue: 3000, maxValue: 9999, bonusAmount: 3000 },
    { minValue: 10000, maxValue: 14999, bonusAmount: 4000 },
    { minValue: 15000, maxValue: 19999, bonusAmount: 6000 },
    { minValue: 20000, maxValue: 34999, bonusAmount: 8000 },
    { minValue: 35000, maxValue: 999999, bonusAmount: 10000 },
  ]);
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [pricingNotes, setPricingNotes] = useState('');

  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedCompanyCode, setGeneratedCompanyCode] = useState("");
  const navigate = useNavigate();
  const handleFileUpload = (e) => {
    const files = e.target.files;
    setAttachedFiles((prevFiles) => [...prevFiles, ...Array.from(files)]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePricing(dynamicPricingEnabled, slabs, effectiveFrom)) {
      return;
    }
    const userToken = sessionStorage.getItem("authToken");

    try {
      const uploadedDocuments = await uploadDocumentsToS3(
        attachedFiles,
        userToken,
      );

      const payload = {
        name: companyName,
        contactNumber: contactNumber,
        address: address,
        gstNumber: gstNumber.toUpperCase(),
        panNumber: panNumber.toUpperCase(),
        remarks: remarks,
        showPrice: showPrice,
        maskInfo: maskInfo,
        emailConfiguration: emailConfiguration,
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
        },
      );

      const companyId = response.data.result._id;

      await axios.post(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/dynamic-pricing/config`,
        {
          companyId,
          isEnabled: dynamicPricingEnabled,
          slabs: slabs.map(s => ({
            minValue: Number(s.minValue),
            maxValue: Number(s.maxValue),
            bonusAmount: Number(s.bonusAmount)
          })),
          effectiveFrom: effectiveFrom || new Date().toISOString().split('T')[0],
          notes: pricingNotes
        },
        { headers: { Authorization: userToken } }
      );

      toast.success("Company Added Successfully!");

      if (response.data.result && response.data.result.companyCode) {
        setGeneratedCompanyCode(response.data.result.companyCode);
        setShowSuccess(true);
      }

      setTimeout(() => {
        navigate("/companylistingdetails");
      }, 3000);
    } catch (err) {
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
    emailConfiguration,
    attachedFiles,
    dynamicPricingEnabled,
    slabs,
    effectiveFrom,
    pricingNotes,
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
    setEmailConfiguration,
    setDynamicPricingEnabled,
    setSlabs,
    setEffectiveFrom,
    setPricingNotes,
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

          <SuccessNotification show={showSuccess} companyCode={generatedCompanyCode} />

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
const AddSlabRow = ({ slab, index, onChange, onRemove }) => (
  <div className="flex flex-col gap-1">
    <div className="flex gap-2 items-center">
      <input
        type="number"
        placeholder="Min"
        className="border border-gray-300 px-2 py-1.5 rounded-lg outline-none w-[100px] text-sm  transition"
        value={slab.minValue}
        onChange={(e) => onChange(index, 'minValue', e.target.value)}
      />
      <span className="text-gray-400">-</span>
      <input
        type="number"
        placeholder="Max"
        className="border border-gray-300 px-2 py-1.5 rounded-lg outline-none w-[100px] text-sm  transition"
        value={slab.maxValue}
        onChange={(e) => onChange(index, 'maxValue', e.target.value)}
      />
      <input
        type="number"
        placeholder="Bonus"
        className="border border-gray-300 px-2 py-1.5 rounded-lg outline-none w-[100px] text-sm transition"
        value={slab.bonusAmount}
        onChange={(e) => onChange(index, 'bonusAmount', e.target.value)}
      />
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="text-red-500 hover:text-red-700 font-bold px-2 text-lg transition"
        title="Remove slab"
      >
        &times;
      </button>
    </div>
    <div className="text-xs text-gray-400 ml-1">Quoted Price = Exact Value - ₹{slab.bonusAmount || 0}</div>
  </div>
);

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
    emailConfiguration,
    attachedFiles,
    dynamicPricingEnabled,
    slabs,
    effectiveFrom,
    pricingNotes,
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
    setEmailConfiguration,
    setDynamicPricingEnabled,
    setSlabs,
    setEffectiveFrom,
    setPricingNotes,
  } = setters;

  const handleSlabChange = (index, field, value) => {
    const updated = [...slabs];
    updated[index] = { ...updated[index], [field]: Number(value) };
    setSlabs(updated);
  };

  const addSlab = () => {
    setSlabs([...slabs, { minValue: 0, maxValue: 0, bonusAmount: 0 }]);
  };

  const removeSlab = (index) => {
    if (slabs.length <= 1) {
      return;
    }
    setSlabs(slabs.filter((_, i) => i !== index));
  };

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

     <div className="w-[70%]">
        <EmailConfiguration
          value={emailConfiguration}
          onChange={setEmailConfiguration}
        />
      </div>

      <div className="flex flex-col w-[70%] gap-1.5">
        <span className="font-medium text-sm text-gray-700">Attach Documents</span>
        <input
          className="py-2 rounded-lg outline-none text-sm"
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

      <div className="w-[70%] mt-2 p-4 border border-gray-200 rounded-lg">
         <div className='flex items-center justify-between mb-3'>
            {sectionTitle('Dynamic Pricing & Bonus Settings')}
          </div>

        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          Configure bonus amount slabs and pricing rules for this company. When enabled,
          the system automatically deducts a fixed Bonus Amount from the device Exact Value
          to calculate the final Quoted Price shown to the customer.
        </p>

        <div className="flex flex-col gap-1.5 mb-4">
          <span className="font-medium text-sm text-gray-700">Enable Dynamic Pricing</span>
          <select
            className="border border-gray-300 px-3 py-2 rounded-lg outline-none bg-white transition text-sm w-[120px]"
            value={dynamicPricingEnabled.toString()}
            onChange={(e) => setDynamicPricingEnabled(e.target.value === "true")}
          >
            <option value="true">ON</option>
            <option value="false">OFF</option>
          </select>
        </div>

        {dynamicPricingEnabled && (
        <div className="flex flex-col gap-4 border-t border-gray-100 pt-4">
          <div>
            <span className="font-semibold text-sm text-gray-800">Bonus Amount Slab Table</span>
          </div>
          <div className="flex gap-2 text-xs font-medium text-gray-500">
            <span className="w-[100px]">Min Value (Rs.)</span>
            <span className="w-[30px]"></span>
            <span className="w-[100px]">Max Value (Rs.)</span>
            <span className="w-[100px]">Bonus Amount (Rs.)</span>
          </div>
          <div className="flex flex-col gap-3">
            {slabs.map((slab, index) => (
              <AddSlabRow
                key={index}
                slab={slab}
                index={index}
                onChange={handleSlabChange}
                onRemove={removeSlab}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={addSlab}
            className="self-start bg-gray-50 border-2 border-dashed border-gray-300 px-4 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:border-gray-400 transition"
          >
            + Add Slab
          </button>

          <div className="grid grid-row-1 md:grid-row-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="font-medium text-sm text-gray-700">Effective From Date</span>
              <p className="text-xs text-gray-400">Set when pricing rules take effect. Must be today or future.</p>
              <input
                type="date"
                className="border border-gray-300 px-3 py-2 rounded-lg outline-none  transition text-sm"
                value={effectiveFrom}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setEffectiveFrom(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="font-medium text-sm text-gray-700">Notes / Remarks</span>
              <textarea
                className="border border-gray-300 px-3 py-2 rounded-lg outline-none  transition text-sm resize-none"
                rows={2}
                value={pricingNotes}
                onChange={(e) => setPricingNotes(e.target.value)}
                placeholder="Internal notes for this pricing configuration..."
              />
            </div>
          </div>
          </div>
        )}
        </div>

        <div className="mt-8">
        <button className="font-medium text-sm text-white p-3 rounded bg-primary">
          Submit Form
        </button>
      </div>
    </form>
  );
};
