import { useState } from 'react';
import { LicenseData } from '../../types';

const UploadLicense = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<LicenseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadAndExtract = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      // TODO: Upload file and call Azure Intelligence endpoint
      // Mock extracted data for now
      const mockData: LicenseData = {
        type: 'Business License',
        issuer: 'State of California',
        issueDate: '2023-01-15',
        expirationDate: '2024-01-15',
      };
      
      setExtractedData(mockData);
      setEditMode(true);
    } catch (error) {
      console.error('Error extracting license data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDataChange = (field: keyof LicenseData, value: string) => {
    if (extractedData) {
      setExtractedData({ ...extractedData, [field]: value });
    }
  };

  const handleConfirm = async () => {
    if (!extractedData) return;

    try {
      // TODO: Save license to database
      console.log('Saving license:', extractedData);
      // Reset form
      setSelectedFile(null);
      setExtractedData(null);
      setEditMode(false);
    } catch (error) {
      console.error('Error saving license:', error);
    }
  };

  return (
    <div className="upload-license">
      <h2>Upload License</h2>
      
      {!extractedData && (
        <div className="upload-section">
          <div className="file-input">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
            />
          </div>
          
          {selectedFile && (
            <div className="file-preview">
              <p>Selected file: {selectedFile.name}</p>
              <button onClick={handleUploadAndExtract} disabled={loading}>
                {loading ? 'Processing...' : 'Upload & Extract Data'}
              </button>
            </div>
          )}
        </div>
      )}

      {extractedData && (
        <div className="extracted-data">
          <h3>Extracted License Data</h3>
          <p>Please review and confirm the extracted information:</p>
          
          <div className="form-group">
            <label>License Type:</label>
            <input
              type="text"
              value={extractedData.type}
              onChange={(e) => handleDataChange('type', e.target.value)}
              disabled={!editMode}
            />
          </div>

          <div className="form-group">
            <label>Issuer:</label>
            <input
              type="text"
              value={extractedData.issuer}
              onChange={(e) => handleDataChange('issuer', e.target.value)}
              disabled={!editMode}
            />
          </div>

          <div className="form-group">
            <label>Issue Date:</label>
            <input
              type="date"
              value={extractedData.issueDate}
              onChange={(e) => handleDataChange('issueDate', e.target.value)}
              disabled={!editMode}
            />
          </div>

          <div className="form-group">
            <label>Expiration Date:</label>
            <input
              type="date"
              value={extractedData.expirationDate}
              onChange={(e) => handleDataChange('expirationDate', e.target.value)}
              disabled={!editMode}
            />
          </div>

          <div className="actions">
            {editMode && (
              <>
                <button onClick={() => setEditMode(false)}>Cancel Edit</button>
                <button onClick={handleConfirm}>Confirm & Save</button>
              </>
            )}
            {!editMode && (
              <>
                <button onClick={() => setEditMode(true)}>Edit</button>
                <button onClick={handleConfirm}>Confirm & Save</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadLicense;