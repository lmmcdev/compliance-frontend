import { useState } from 'react';
import { ComplianceCase, Document } from '../../types';

const ComplianceForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    notes: '',
  });
  const [documents, setDocuments] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setDocuments(prev => [...prev, ...newFiles]);
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a case title');
      return;
    }

    setUploading(true);
    try {
      // TODO: Upload documents and create compliance case
      const newCase: Omit<ComplianceCase, 'id'> = {
        title: formData.title,
        description: formData.description,
        notes: formData.notes,
        status: 'open',
        createdDate: new Date(),
        updatedDate: new Date(),
        documents: [], // Will be populated after file upload
      };

      console.log('Creating compliance case:', newCase);
      console.log('Uploading documents:', documents);

      // Reset form
      setFormData({ title: '', description: '', notes: '' });
      setDocuments([]);
      
      alert('Compliance case created successfully!');
    } catch (error) {
      console.error('Error creating compliance case:', error);
      alert('Error creating compliance case. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="compliance-form">
      <h2>Create Compliance Case</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Case Title *</label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter case title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter case description"
            rows={4}
          />
        </div>

        <div className="form-group">
          <label htmlFor="documents">Upload Documents</label>
          <input
            id="documents"
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
            onChange={handleFileUpload}
          />
          
          {documents.length > 0 && (
            <div className="document-list">
              <h4>Selected Documents:</h4>
              <ul>
                {documents.map((file, index) => (
                  <li key={index} className="document-item">
                    <span>{file.name}</span>
                    <span className="file-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="remove-btn"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Additional notes or comments"
            rows={3}
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => {
            setFormData({ title: '', description: '', notes: '' });
            setDocuments([]);
          }}>
            Clear Form
          </button>
          
          <button type="submit" disabled={uploading}>
            {uploading ? 'Creating Case...' : 'Create Compliance Case'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComplianceForm;