import React, { useState } from "react";
import { createWorker } from "tesseract.js";

const OCRApp = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copySuccess, setCopySuccess] = useState("");

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setExtractedText("");
      setCopySuccess("");
    }
  };

  const extractText = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setProgress(0);
    setExtractedText("");
    setCopySuccess("");

    try {
      const worker = await createWorker("eng");

      const ret = await worker.recognize(selectedImage);

      console.log(ret.data.text);
      setExtractedText(ret.data.text);

      await worker.terminate();
    } catch (error) {
      console.error("OCR Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!extractedText) return;

    try {
      await navigator.clipboard.writeText(extractedText);
      setCopySuccess("Copied to clipboard!");
      setTimeout(() => setCopySuccess(""), 3000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setCopySuccess("Failed to copy text");
      setTimeout(() => setCopySuccess(""), 3000);
    }
  };

  return (
    <div className="ocr-container">
      <h1 className="ocr-title">Image Text Extractor</h1>
      <p className="ocr-subtitle">Upload an image and extract text instantly</p>

      <label className="upload-box">
        <svg
          width="50px"
          height="50px"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            opacity="0.5"
            d="M17 9.00195C19.175 9.01406 20.3529 9.11051 21.1213 9.8789C22 10.7576 22 12.1718 22 15.0002V16.0002C22 18.8286 22 20.2429 21.1213 21.1215C20.2426 22.0002 18.8284 22.0002 16 22.0002H8C5.17157 22.0002 3.75736 22.0002 2.87868 21.1215C2 20.2429 2 18.8286 2 16.0002L2 15.0002C2 12.1718 2 10.7576 2.87868 9.87889C3.64706 9.11051 4.82497 9.01406 7 9.00195"
            stroke="#ebebeb"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <path
            d="M12 15L12 2M12 2L15 5.5M12 2L9 5.5"
            stroke="#ebebeb"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        <p>Choose an image</p>
      </label>

      {selectedImage && (
        <div className="preview-container">
          <img src={selectedImage} alt="Selected" className="preview-image" />

          <button
            onClick={extractText}
            disabled={loading}
            className="extract-btn"
          >
            {loading ? `Extracting (${progress}%)...` : "Extract Text"}
          </button>

          {loading && (
            <div className="progress-wrapper">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="progress-text">Processing image...</div>
            </div>
          )}
        </div>
      )}

      {extractedText && (
        <div className="result-box">
          <div className="result-header">
            <h3 className="result-title">Extracted Text</h3>
            <button onClick={copyToClipboard} className="copy-btn">
              <svg
                width="20px"
                height="20px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 11C6 8.17157 6 6.75736 6.87868 5.87868C7.75736 5 9.17157 5 12 5H15C17.8284 5 19.2426 5 20.1213 5.87868C21 6.75736 21 8.17157 21 11V16C21 18.8284 21 20.2426 20.1213 21.1213C19.2426 22 17.8284 22 15 22H12C9.17157 22 7.75736 22 6.87868 21.1213C6 20.2426 6 18.8284 6 16V11Z"
                  stroke="#ebebeb"
                  strokeWidth="1.5"
                />
                <path
                  d="M6 19C4.34315 19 3 17.6569 3 16V10C3 6.22876 3 4.34315 4.17157 3.17157C5.34315 2 7.22876 2 11 2H15C16.6569 2 18 3.34315 18 5"
                  stroke="#ebebeb"
                  strokeWidth="1.5"
                />
              </svg>
              Copy Text
            </button>
            {copySuccess && <div className="copy-success">{copySuccess}</div>}
          </div>
          <div className="result-text">{extractedText}</div>
        </div>
      )}
    </div>
  );
};

export default OCRApp;
