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

    (async () => {
      const worker = await createWorker("eng");
      const ret = await worker.recognize(selectedImage);
      console.log(ret.data.text);
      setExtractedText(ret.data.text);
      await worker.terminate();
    })();
    if (!selectedImage) return;

    setLoading(true);
    setProgress(0);
  };

  return (
    <div
      style={{
        textAlign: "center",
        margin: "50px auto",
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        padding: "20px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        backgroundColor: "#f9f9f9",
      }}
    >
      <h1 style={{ color: "#333", fontSize: "24px", marginBottom: "20px" }}>
        Image Text Extractor
      </h1>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{
          marginBottom: "20px",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      />
      {selectedImage && (
        <div>
          <img
            src={selectedImage}
            alt="Selected"
            style={{
              maxWidth: "100%",
              maxHeight: "300px",
              marginTop: "20px",
              borderRadius: "8px",
              border: "1px solid #ddd",
            }}
          />
          <br />
          <button
            onClick={extractText}
            disabled={loading}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: loading ? "#ddd" : "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "16px",
            }}
          >
            {loading ? `Extracting (${progress}%)...` : "Extract Text"}
          </button>
        </div>
      )}
      {extractedText && (
        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            backgroundColor: "#fff",
            textAlign: "left",
          }}
        >
          <h3 style={{ color: "#333", marginBottom: "10px" }}>
            Extracted Text:
          </h3>
          <p style={{ color: "#555", whiteSpace: "pre-wrap" }}>
            {extractedText}
          </p>
        </div>
      )}
    </div>
  );
};

export default OCRApp;
