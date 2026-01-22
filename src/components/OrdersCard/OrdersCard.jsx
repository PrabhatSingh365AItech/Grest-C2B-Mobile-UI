import React, { useEffect, useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import {
  setLeadOTPData,
  setResponseData,
} from "../../store/slices/responseSlice";
import { useDispatch } from "react-redux";
import watch from "../../assets/apple_watch.png";
import { setOtpVerified } from "../../store/slices/otpSlice";
import PurchaseReceipt from "../PurchaseReceipt";
import ReactDOMServer from "react-dom/server";
import html2pdf from "html2pdf.js";
import { FaDownload } from "react-icons/fa6";
import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { FileOpener } from "@awesome-cordova-plugins/file-opener";
import { fetchSignatureAsBase64 } from "../../utils/fetchSignatureAsBase64";

const purchaseReceiptTitle = "Purchase Receipt";
const herePurchaseReceipt = "Here is your purchase receipt";
const shareReceipt = "Share Receipt";
const shareCanceled = "Share canceled";
const quoteSaved = "Quote Saved";
export const DeleteModal = ({ onCancel, onConfirm }) => {
  return (
    <div className="fixed z-50 flex items-center justify-center w-full h-full mx-2 transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
      <div className="absolute top-0 left-0 w-full h-full bg-gray-800 opacity-50"></div>
      <div className="bg-white border border-gray-300 p-6 w-96 max-w-[90%] mx-auto rounded-md z-10">
        <p className="mb-4 text-lg font-semibold">Do you want to delete?</p>
        <div className="flex justify-end">
          <button
            onClick={onConfirm}
            className="bg-primary text-white px-4 py-2 rounded mr-2"
          >
            Yes
          </button>
          <button
            onClick={onCancel}
            className="border border-primary text-primary px-4 py-2 rounded"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to convert blob to base64
const convertBlobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

async function handleBrowserDownload(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function hanldlejsx_pdf(item) {
  if (window._isSharing) {
    return;
  }
  window._isSharing = true;

  try {
    const printElement = await buildPrintElement(item);
    const pdf = html2pdf().set(getPdfOptions()).from(printElement).toPdf();
    const blob = await pdf.output("blob");
    const fileName = `purchase_receipt_${Date.now()}.pdf`;

    // Check if running in Capacitor (native app) or browser
    if (Capacitor.isNativePlatform()) {
      // Native app behavior (existing functionality)
      const base64Data = await convertBlobToBase64(blob);
      if (Capacitor.getPlatform() === "ios") {
        await handleIOSSharing(base64Data, fileName);
      } else {
        await handleAndroidSharing(base64Data, fileName);
      }
    } else {
      // Browser behavior - direct download
      await handleBrowserDownload(blob, fileName);
    }
  } catch (error) {
    console.error("PDF handling error:", error);
    if (Capacitor.isNativePlatform()) {
      await tryDirectHtmlShare(printElement);
    } else {
      console.error("Failed to download PDF in browser");
    }
  } finally {
    setTimeout(() => {
      window._isSharing = false;
    }, 500);
  }
}

async function buildPrintElement(item) {
  console.log("order item", item);
  const formattedDate = new Date(item.updatedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const signatureUrl = item?.doc?.signature;
  const signatureBase64 = signatureUrl
    ? await fetchSignatureAsBase64(signatureUrl)
    : null;

  const maskInfo = item.companyInfo.maskInfo;

  return ReactDOMServer.renderToString(
    <PurchaseReceipt
      phoneNumber={item.phoneNumber}
      aadharNumber={item?.aadharNumber}
      uniqueCode={item.uniqueCode}
      emailId={item.emailId}
      name={item.name}
      imeiNumber={item.doc.IMEI}
      phoneName={item.model.name}
      type={item?.model?.type}
      // storeName={item.store.storeName}
      // region={item.store.region}
      // address={item.store.address}
      storage={item.model.config?.storage}
      RAM={item.model.config?.RAM}
      formattedDate={formattedDate}
      price={item.price}
      signatureUrl={signatureBase64 || signatureUrl}
      maskInfo={maskInfo}
    />,
  );
}

function getPdfOptions() {
  return {
    margin: 10,
    filename: "purchase_receipt.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["css", "legacy"] },
  };
}

async function handleIOSSharing(base64Data, fileName) {
  try {
    const uri = await writeFileToCache(base64Data, fileName);
    await tryShare({ url: uri });
    await cleanupFile(fileName);
  } catch (err) {
    console.error("iOS file handling error:", err);
    await tryShare({ url: base64Data });
  }
}

async function handleAndroidSharing(base64Data, fileName) {
  try {
    const uri = await writeFileToCache(base64Data, fileName);
    try {
      await tryShare({ url: uri });
    } catch (shareError) {
      console.log("Share failed, trying FileOpener:", shareError);
      await FileOpener.open({
        filePath: uri,
        contentType: "application/pdf",
      });
    }
    await cleanupFile(fileName);
  } catch (err) {
    console.error("Android file handling error:", err);
    await tryShare({ url: base64Data });
  }
}

async function writeFileToCache(base64Data, fileName) {
  await Filesystem.writeFile({
    data: base64Data.split(",")[1],
    path: fileName,
    recursive: true,
    directory: Directory.Cache,
  });
  const { uri } = await Filesystem.getUri({
    path: fileName,
    directory: Directory.Cache,
  });
  return uri;
}

async function tryShare({ url }) {
  try {
    const result = await Share.share({
      url,
      text: herePurchaseReceipt,
      title: purchaseReceiptTitle,
      dialogTitle: shareReceipt,
    });
    if (result.activityType) {
      console.log("Share completed:", result.activityType);
    }
  } catch (error) {
    if (error.message !== shareCanceled) {
      throw error;
    }
  }
}

async function cleanupFile(fileName) {
  try {
    await Filesystem.deleteFile({
      path: fileName,
      directory: Directory.Cache,
    });
  } catch (err) {
    console.log("Cleanup error (non-critical):", err);
  }
}

async function tryDirectHtmlShare(htmlContent) {
  try {
    await Share.share({
      title: purchaseReceiptTitle,
      text: herePurchaseReceipt,
      url: htmlContent,
      dialogTitle: shareReceipt,
    });
  } catch (err) {
    if (err.message !== shareCanceled) {
      console.error("Share fallback error:", err);
    }
  }
}

const OrdersCard = ({
  allData,
  itemData,
  title,
  customerName,
  customerMobile,
  customerEmail,
  deviceName,
  savedBy,
  deviceRam,
  deviceStorage,
  price,
  quoteId,
  dateTime,
  phonePhoto,
  handleDelete,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const deviceSelected = sessionStorage.getItem("DeviceType");

  const formatDateTime = (dateTimeString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };

    return new Intl.DateTimeFormat("en-IN", options).format(
      new Date(dateTimeString),
    );
  };

  useEffect(() => {
    console.log("card");
  }, []);

  const isExpired = () => {
    const createdDate = new Date(dateTime);
    const currentDate = new Date();
    const timeDiff = currentDate - createdDate;
    const oneDay = 24 * 60 * 60 * 1000; // 1 day in milliseconds
    const fifteenDays = 15 * oneDay; // 15 days in milliseconds

    if (title === quoteSaved) {
      return timeDiff > fifteenDays;
    } else if (title === "Order Saved") {
      return timeDiff > fifteenDays;
    } else {
      return false;
    }
  };

  const handleInitiate = () => {
    if (isExpired()) {
      return;
    }
    if (title === quoteSaved) {
      const detail = {
        models: itemData.lead?.model,
        phoneNumber: customerMobile,
        status: quoteSaved,
        customerName: customerName,
      };
      sessionStorage.setItem("dataModel", JSON.stringify(detail));
      const responseData = {
        grade: "",
        id: itemData.lead_id,
        price: price,
        uniqueCode: quoteId,
        bonus: 0,
      };
      dispatch(setResponseData(responseData));
      sessionStorage.setItem("LeadId", itemData?.lead_id);
      sessionStorage.setItem("responsedatadata", JSON.stringify(responseData));
      navigate("/device/Qestions");
    } else {
      const otpData = {
        name: customerName,
        email: customerEmail,
        phone: customerMobile,
      };
      localStorage.setItem("otpData", JSON.stringify(otpData));
      const detail = {
        models: itemData.lead?.model,
        customerName: customerName,
      };
      sessionStorage.setItem("dataModel", JSON.stringify(detail));
      const responseData = {
        grade: "",
        id: itemData.lead_id,
        price: Number(itemData.lead?.price) - Number(itemData.lead?.bonusPrice),
        uniqueCode: quoteId,
        bonus: Number(itemData.lead?.bonusPrice),
      };

      dispatch(setResponseData(responseData));
      dispatch(setLeadOTPData(otpData));
      dispatch(setOtpVerified(false));
      sessionStorage.setItem("otpData", JSON.stringify(otpData));
      sessionStorage.setItem("LeadId", itemData?.lead_id);
      sessionStorage.setItem("responsedatadata", JSON.stringify(responseData));
      navigate("/inputnumber");
    }
  };

  const handleDeleteConfirmation = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmed = () => {
    setShowDeleteModal(false);
    handleDelete(itemData._id);
  };

  const handleDeleteCancelled = () => {
    setShowDeleteModal(false);
  };

  return (
    <div className="p-2 mx-2 bg-white rounded-lg relative">
      {isExpired() && (
        <div className="absolute inset-0 flex items-center justify-center bg-opacity-75 bg-white">
          <div className="text-black text-2xl font-bold border-4 border-primary px-4 py-2 rounded-md">
            Expired
          </div>
        </div>
      )}
      <div className="flex items-center justify-between p-2 border-b-2 border-gray-300 border-dashed">
        <div className="flex items-center py-1 px-2 text-white bg-primary rounded-xl">
          <p className="text-sm font-medium">{title}</p>
        </div>
        {title === "Order Completed" && (
          <div
            onClick={() => hanldlejsx_pdf(allData)}
            className="flex items-center h-full px-4 text-white bg-[#EC2752] rounded-xl"
          >
            <FaDownload size={15} />
          </div>
        )}
        <div className="">
          <p className="text-sm font-medium text-gray-400">
            {formatDateTime(dateTime)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 p-2 border-b-2 border-gray-300 border-dashed">
        <div className="w-[20%] max-h-[80px] flex items-center">
          <img
            className="w-full h-auto max-h-[80px] object-contain"
            src={deviceSelected === "Watch" ? watch : phonePhoto}
            alt="device image"
          />
        </div>
        <div className="font-medium w-[78%]">
          <p className="text-black text-wrap">
            {deviceName}
            {deviceSelected === "CTG1" && `(${deviceRam}/${deviceStorage})`}
          </p>
          <p className="text-primary">₹{price}</p>
        </div>
      </div>

      <div className="flex flex-wrap justify-between p-2 text-sm font-medium">
        <div className="w-1/2 ">
          <p className="text-gray-400">Customer Name</p>
          <p>{customerName}</p>
        </div>
        <div className="w-1/2">
          <p className="text-gray-400">Customer Mobile</p>
          <p>{customerMobile}</p>
        </div>
        <div className="w-1/2 mt-2">
          <p className="text-gray-400">Quote Id</p>
          <p>{quoteId}</p>
        </div>
        <div className="w-1/2 mt-2">
          <p className="text-gray-400">Saved By</p>
          <p>{savedBy}</p>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteModal
          onCancel={handleDeleteCancelled}
          onConfirm={handleDeleteConfirmed}
        />
      )}
      {title !== "Order Completed" && !isExpired() && (
        <div className="flex items-center justify-between gap-2 p-2 font-medium">
          <div
            onClick={handleDeleteConfirmation}
            className="px-3 py-2 border-2 rounded-lg"
          >
            <button>
              <RiDeleteBin6Line size={20} />
            </button>
          </div>
          <div className="w-[80%] text-center bg-primary py-2 rounded-lg">
            <button onClick={handleInitiate} className="text-white ">
              Initiate Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersCard;
