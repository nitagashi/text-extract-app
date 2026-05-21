import React, { useState } from "react";
import { createWorker } from "tesseract.js";

const OCRApp = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const extractText = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setProgress(0);

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
          <h3 className="result-title">Extracted Text</h3>

          <div className="result-text">{extractedText}</div>
        </div>
      )}
    </div>
  );
};

export default OCRApp;
