import React, { useState, useEffect } from "react";
import Quagga from "quagga";
import { IoMdArrowRoundBack } from "react-icons/io";
import styles from "../styles/Scanner.module.css";
import { Camera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

const Scanner = (props) => {
  const [result, setResult] = useState("");
  const [status, setStatus] = useState("steady");
  const [error, setError] = useState(null);
  const isAndroid = Capacitor.getPlatform() === 'android';

  const checkAndRequestPermissions = async () => {
    try {
      // Check camera permission first
      const permission = await Camera.checkPermissions();
      
      if (permission.camera !== 'granted') {
        const request = await Camera.requestPermissions();
        if (request.camera !== 'granted') {
          throw new Error('Camera permission was denied');
        }
      }

      // Clear any previous errors since permissions are now granted
      setError(null);
      return true;
    } catch (err) {
      console.error('Permission error:', err);
      if (err.message.includes('external storage')) {
        // If it's a storage permission error and camera is granted, we can still proceed
        return true;
      }
      setError(err.message || 'Camera permission is required');
      return false;
    }
  };

  const initializeScanner = async () => {
    try {
      if (isAndroid) {
        const hasPermission = await checkAndRequestPermissions();
        if (!hasPermission) return;
      }

      // Clean up any existing instance
      try {
        Quagga.stop();
      } catch (e) {
        // Ignore if not initialized
      }

      await new Promise((resolve, reject) => {
        Quagga.init(
          {
            inputStream: {
              name: "Live",
              type: "LiveStream",
              target: document.querySelector("#interactive"),
              constraints: {
                facingMode: "environment",
                ...(isAndroid && {
                  width: { min: 640, ideal: 1280, max: 1920 },
                  height: { min: 480, ideal: 720, max: 1080 },
                  aspectRatio: { min: 1, max: 2 },
                  focusMode: "continuous"
                })
              }
            },
            decoder: {
              readers: ["code_128_reader"],
              multiple: false,
              debug: {
                drawBoundingBox: false,
                showPattern: false,
                drawScanline: false
              }
            },
            locate: true,
            numOfWorkers: 2
          },
          function (err) {
            if (err) {
              console.error("Quagga initialization error:", err);
              reject(err);
              return;
            }
            console.log("Quagga initialization succeeded");
            resolve();
          }
        );
      });

      await Quagga.start();
      console.log("Quagga started successfully");
    } catch (err) {
      console.error("Camera initialization error:", err);
      // Only set error if it's not a storage permission issue
      if (!err.message?.includes('external storage')) {
        setError(err.message || 'Failed to initialize camera');
      }
      throw err;
    }
  };

  useEffect(() => {
    let mounted = true;

    const setupScanner = async () => {
      try {
        await initializeScanner();
        if (mounted) {
          Quagga.onDetected(onDetected);
          Quagga.onProcessed(onProcessed);
        }
      } catch (err) {
        if (mounted) {
          console.error("Setup error:", err);
          setError('Please check camera permissions and try again');
        }
      }
    };

    setupScanner();

    return () => {
      mounted = false;
      try {
        Quagga.offProcessed(onProcessed);
        Quagga.offDetected(onDetected);
        Quagga.stop();
      } catch (err) {
        console.error("Cleanup error:", err);
      }
    };
  }, []);

  const onDetected = (res) => {
    try {
      console.log("Code detected:", res);
      setResult(res.codeResult.code);
      setStatus("success");
      props.setImei(res.codeResult.code);
      Quagga.stop();
      props.scanBoxSwitch();
    } catch (err) {
      console.error("Detection error:", err);
      setError('Failed to process detected code');
    }
  };

  const onProcessed = (result1) => {
    if (result1) {
      setStatus("error");
    }
  };

  const retryScanner = async () => {
    setError(null);
    try {
      // Clean up before retrying
      Quagga.stop();
      await initializeScanner();
    } catch (err) {
      console.error("Retry failed:", err);
      setError('Failed to restart scanner. Please try again.');
    }
  };

  return (
    <React.Fragment>
      <div className={`my-auto ${styles.scan_page_wrap}`}>
        <div className={"flex flex-row gap-4 w-full items-center justify-center"}>
          <button 
            className="mb-2" 
            onClick={() => {
              Quagga.stop();
              props.scanBoxSwitch();
            }}
          >
            <IoMdArrowRoundBack size={20} className="mr-1" />
            Back
          </button>
        </div>
        {error && (
          <div className="text-red-500 p-4 text-center">
            {error}
            <button 
              className="ml-2 text-blue-500 underline"
              onClick={retryScanner}
            >
              Retry
            </button>
          </div>
        )}
        <div
          id="interactive"
          className={`border-2 ${status === "steady" && "border-primary"} ${
            status === "success" && "border-green-300"
          } ${status === "error" && "border-red-500"}`}
          style={{
            position: 'relative',
            height: '300px',
            backgroundColor: '#000' // Better contrast for scanning
          }}
        ></div>
        <p className={"mx-5"}>
          <span className={"text-xs font-medium"}>Last result: {result}</span>
        </p>
      </div>
    </React.Fragment>
  );
};

export default Scanner;
