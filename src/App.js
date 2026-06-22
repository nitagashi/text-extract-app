import React, { useState, useEffect } from "react";
import { createWorker } from "tesseract.js";

export default function OCRApp() {
  const [images, setImages] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.url));
    };
  }, [images]);

  const handleUpload = (e) => {
    const files = Array.from(e.target.files || []);

    const uploadedImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...uploadedImages]);
  };

  const extractText = async () => {
    if (!images.length) return;

    setLoading(true);
    setProgress(0);

    const worker = await createWorker("eng");

    try {
      const extractedResults = [];

      for (let i = 0; i < images.length; i++) {
        const result = await worker.recognize(images[i].url);

        extractedResults.push({
          image: images[i].url,
          text: result.data.text,
        });

        setProgress(Math.round(((i + 1) / images.length) * 100));
      }

      setResults(extractedResults);
    } catch (error) {
      console.error(error);
    } finally {
      await worker.terminate();
      setLoading(false);
    }
  };

  const updateText = (index, value) => {
    setResults((prev) =>
      prev.map((item, i) => (i === index ? { ...item, text: value } : item)),
    );
  };

  const copyText = async (text) => {
    await navigator.clipboard.writeText(text);
  };

  const copyAll = async () => {
    const text = results
      .map((r) => r.text)
      .join("\n\n====================\n\n");

    await navigator.clipboard.writeText(text);
  };

  const downloadTxt = () => {
    const text = results
      .map((r) => r.text)
      .join("\n\n====================\n\n");

    const blob = new Blob([text], {
      type: "text/plain",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "ocr-results.txt";
    a.click();

    URL.revokeObjectURL(url);
  };

  const removeItem = (index) => {
    URL.revokeObjectURL(images[index].url);

    setImages((prev) => prev.filter((_, i) => i !== index));

    setResults((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="wrapper">
      <div className="ocr-container">
        <h1>Image Text Extractor</h1>

        <label className="upload-box">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleUpload}
          />
          <span>Choose Images</span>
        </label>

        {images.length > 0 && (
          <>
            <div className="image-grid">
              {images.map((img, index) => (
                <div key={index} className="image-card">
                  <img
                    src={img.url}
                    alt=""
                    className="preview-image"
                    onClick={() => setPreviewImage(img.url)}
                  />

                  <button
                    className="delete-btn"
                    onClick={() => removeItem(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <button
              className="extract-btn"
              disabled={loading}
              onClick={extractText}
            >
              {loading ? `Processing ${progress}%` : "Extract Text"}
            </button>
          </>
        )}

        {loading && (
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        )}

        {results.length > 0 && (
          <div className="result-box">
            <div className="toolbar">
              <button onClick={copyAll}>Copy All</button>

              <button onClick={downloadTxt}>Download TXT</button>
            </div>

            {results.map((result, index) => (
              <div key={index} className="result-item">
                <div className="result-header">
                  <h3>Image {index + 1}</h3>

                  <button onClick={() => copyText(result.text)}>Copy</button>
                </div>

                <textarea
                  value={result.text}
                  onChange={(e) => updateText(index, e.target.value)}
                  className="editable-text"
                />
              </div>
            ))}
          </div>
        )}
      </div>
      {previewImage && (
        <div className="modal" onClick={() => setPreviewImage(null)}>
          <button className="modal-close" onClick={() => setPreviewImage(null)}>
            ×
          </button>

          <img
            src={previewImage}
            alt=""
            className="modal-image"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
