import React, { useState, useEffect } from "react";
import { createWorker } from "tesseract.js";

export default function OCRApp() {
  const [images, setImages] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    return () => {
      images.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  const handleUpload = (event) => {
    const files = Array.from(event.target.files || []);

    const urls = files.map((file) => URL.createObjectURL(file));

    setImages(urls);
    setResults([]);
  };

  const extractText = async () => {
    if (!images.length) return;

    setLoading(true);
    setProgress(0);

    const worker = await createWorker("eng");

    try {
      const extracted = [];

      for (let i = 0; i < images.length; i++) {
        const result = await worker.recognize(images[i]);

        extracted.push({
          image: images[i],
          text: result.data.text,
        });

        setProgress(Math.round(((i + 1) / images.length) * 100));
      }

      setResults(extracted);
    } catch (err) {
      console.error(err);
    } finally {
      await worker.terminate();
      setLoading(false);
    }
  };

  const copyAll = async () => {
    const text = results.map((r) => r.text).join("\n\n-----------------\n\n");

    await navigator.clipboard.writeText(text);
  };

  const downloadText = () => {
    const text = results.map((r) => r.text).join("\n\n-----------------\n\n");

    const blob = new Blob([text], {
      type: "text/plain",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "ocr-result.txt";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="ocr-container">
      <h1>Image Text Extractor</h1>

      <label className="upload-box">
        <input type="file" multiple accept="image/*" onChange={handleUpload} />

        <span>Select Images</span>
      </label>

      {images.length > 0 && (
        <>
          <div className="image-grid">
            {images.map((img) => (
              <img key={img} src={img} alt="" className="preview-image" />
            ))}
          </div>

          <button
            className="extract-btn"
            onClick={extractText}
            disabled={loading}
          >
            {loading ? `Processing ${progress}%` : "Extract Text"}
          </button>
        </>
      )}

      {loading && (
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      )}

      {results.length > 0 && (
        <div className="result-box">
          <div className="result-actions">
            <button onClick={copyAll}>Copy All</button>

            <button onClick={downloadText}>Download TXT</button>
          </div>

          {results.map((result, index) => (
            <div key={index} className="result-item">
              <h3>Image {index + 1}</h3>

              <pre>{result.text}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
