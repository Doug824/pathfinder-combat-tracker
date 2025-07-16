import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebase';
import { pdfProcessingService } from '../../services/pdfProcessingService';
import { bestiaryService } from '../../services/bestiaryService';
import './Campaign.css';

const PDFUploader = ({ campaign, currentUser, onUploadComplete, onClose }) => {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (file) => {
    if (file && file.type === 'application/pdf') {
      processFile(file);
    } else {
      setError('Please select a PDF file');
    }
  };

  const processFile = async (file) => {
    setUploading(true);
    setProcessing(true);
    setError('');
    setProgress(0);

    try {
      // Step 1: Process PDF locally first (doesn't require Firebase Storage)
      setProgress(20);
      const processingResult = await pdfProcessingService.processFile(file);
      
      if (!processingResult.success) {
        throw new Error(processingResult.error);
      }

      setProgress(40);
      
      // Step 2: Skip Firebase Storage upload for now (CORS issues in localhost)
      // TODO: Re-enable when Firebase Storage is properly configured
      let downloadURL = null;
      console.log('Skipping Firebase Storage upload due to CORS issues in localhost environment');

      setProgress(80);
      
      // Step 3: Save creatures to Firestore
      if (processingResult.creatures.length > 0) {
        const savedCreatures = await bestiaryService.addCreatures(
          campaign.id,
          processingResult.creatures,
          currentUser.uid,
          downloadURL ? {
            name: file.name,
            url: downloadURL,
            uploadedAt: new Date()
          } : null
        );
        
        setProgress(100);
        setResults({
          ...processingResult,
          creatures: savedCreatures,
          downloadURL
        });
      } else {
        setProgress(100);
        setResults({
          ...processingResult,
          downloadURL
        });
      }

      setUploading(false);
      setProcessing(false);
      
    } catch (err) {
      console.error('Error processing PDF:', err);
      setError(err.message || 'Failed to process PDF');
      setUploading(false);
      setProcessing(false);
      setProgress(0);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleComplete = () => {
    if (results && results.creatures) {
      onUploadComplete(results);
    }
    onClose();
  };

  return (
    <div className="pdf-uploader-overlay">
      <div className="pdf-uploader">
        <div className="uploader-header">
          <h2>Upload PDF Bestiary</h2>
          <button 
            className="close-button"
            onClick={onClose}
            disabled={uploading}
          >
            ×
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {!uploading && !results && (
          <div className="upload-section">
            <div 
              className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="drop-zone-content">
                <div className="upload-icon">📄</div>
                <p>Drag and drop a PDF file here, or click to select</p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="file-input"
                />
                <button 
                  className="select-file-button"
                  onClick={() => document.querySelector('.file-input').click()}
                >
                  Select PDF File
                </button>
              </div>
            </div>

            <div className="upload-info">
              <h3>What this does:</h3>
              <ul>
                <li>Extracts text from your PDF bestiary or monster manual</li>
                <li>Automatically identifies creature stat blocks</li>
                <li>Parses creature names, stats, abilities, and actions</li>
                <li>Adds creatures to your campaign bestiary</li>
              </ul>
              
              <div className="upload-tips">
                <h4>Tips for best results:</h4>
                <ul>
                  <li>Use PDFs with clear, well-formatted stat blocks</li>
                  <li>Text-based PDFs work better than scanned images</li>
                  <li>Standard D&D 5e or Pathfinder formats are supported</li>
                  <li>Review and edit extracted creatures after processing</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {uploading && (
          <div className="processing-section">
            <div className="processing-header">
              <h3>Processing PDF...</h3>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="progress-text">{progress}%</span>
            </div>

            <div className="processing-steps">
              <div className={`step ${progress >= 20 ? 'completed' : ''}`}>
                <span className="step-icon">🔍</span>
                <span>Extracting text...</span>
              </div>
              <div className={`step ${progress >= 40 ? 'completed' : ''}`}>
                <span className="step-icon">🧠</span>
                <span>Parsing creatures...</span>
              </div>
              <div className={`step ${progress >= 80 ? 'completed' : ''}`}>
                <span className="step-icon">📤</span>
                <span>Processing complete...</span>
              </div>
              <div className={`step ${progress >= 100 ? 'completed' : ''}`}>
                <span className="step-icon">💾</span>
                <span>Saving to bestiary...</span>
              </div>
            </div>
          </div>
        )}

        {results && (
          <div className="results-section">
            <div className="results-header">
              <h3>Processing Complete!</h3>
              <div className="results-summary">
                <div className="result-stat">
                  <span className="stat-number">{results.creatures.length}</span>
                  <span className="stat-label">Creatures Found</span>
                </div>
              </div>
            </div>

            {results.creatures.length > 0 ? (
              <div className="creatures-preview">
                <h4>Extracted Creatures:</h4>
                <div className="creatures-list">
                  {results.creatures.slice(0, 5).map((creature, index) => (
                    <div key={index} className="creature-preview">
                      <div className="creature-name">{creature.name}</div>
                      <div className="creature-details">
                        {creature.type && <span className="creature-type">{creature.type}</span>}
                        {creature.challenge_rating && (
                          <span className="creature-cr">CR {creature.challenge_rating}</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {results.creatures.length > 5 && (
                    <div className="more-creatures">
                      +{results.creatures.length - 5} more creatures
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="no-creatures">
                <p>No creatures were automatically detected in this PDF.</p>
                <p>The PDF has been uploaded and you can manually add creatures later.</p>
              </div>
            )}

            <div className="results-actions">
              <button 
                className="complete-button"
                onClick={handleComplete}
              >
                {results.creatures.length > 0 ? 'Add to Bestiary' : 'Complete'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFUploader;