import './App.css';
import React, { useState } from "react";
import Tesseract from "tesseract.js";
import axios from "axios";
import { jsPDF } from "jspdf";

const Mains = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [ocrText, setOcrText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  const handleProcessFiles = async () => {
    if (selectedFiles.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    setIsProcessing(true);
    setOcrText("");
    setProgress(0);

    try {
      let combinedText = "";

      for (const file of selectedFiles) {
        const result = await Tesseract.recognize(file, "eng", {
          logger: (info) => {
            if (info.status === "recognizing text") {
              setProgress(Math.round(info.progress * 100));
            }
            console.log(info);
          },
        });

        combinedText += result.data.text + "\n";
      }

      setOcrText(combinedText);
      await axios.post("http://localhost:3001/data", { text: combinedText }); // Updated port

      alert("✅ OCR text saved to database.");
      setSelectedFiles([]); // Clear file input
    } catch (error) {
      console.error("❌ Error during OCR or DB save:", error);
      alert("Something went wrong during the OCR process.");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text(ocrText || "No OCR result available.", 10, 10);
    doc.save("ocr-result.pdf");
  };

  return (
    <div id="webcrumbs">
      <div className="w-[1200px] bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col gap-6">
          <h1 className="text-5xl font-title text-neutral-950 text-center">MyScanner</h1>

          <div className="grid grid-cols-2 gap-6">
            {/* Left: Upload Section */}
            <section className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold text-neutral-950">Upload Images for OCR</h2>
              <div className="flex flex-col items-center border border-neutral-300 p-4 rounded-md">
                <p className="text-neutral-500">Choose image files</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="mt-4"
                />
                <button
                  onClick={handleProcessFiles}
                  className="bg-primary-500 text-white px-4 py-2 rounded-md mt-4"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Convert to Text"}
                </button>
                {isProcessing && (
                  <p className="text-sm text-neutral-500 mt-2">Progress: {progress}%</p>
                )}
              </div>
            </section>

            {/* Right: OCR Result */}
            <section className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold text-neutral-950">OCR Results</h2>
              <div className="flex flex-col items-start border border-neutral-300 p-4 rounded-md h-60 overflow-y-auto">
                {ocrText ? (
                  <pre className="text-neutral-600 text-sm whitespace-pre-wrap">{ocrText}</pre>
                ) : (
                  <p className="text-neutral-500">OCR results will appear here.</p>
                )}
              </div>
            </section>
          </div>

          {/* Download Button */}
          {ocrText && (
            <div className="mt-4 text-center">
              <button
                onClick={downloadPDF}
                className="bg-green-600 text-white px-4 py-2 rounded-md"
              >
                Download as PDF
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Mains;
