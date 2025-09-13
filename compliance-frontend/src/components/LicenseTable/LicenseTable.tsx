import { useState, useEffect } from 'react';
import { License } from '../../types';

const LicenseTable = () => {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch licenses from API
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="license-table">
      <h2>License Management</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Issuer</th>
              <th>Issue Date</th>
              <th>Expiration Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {licenses.map((license) => (
              <tr key={license.id}>
                <td>{license.type}</td>
                <td>{license.issuer}</td>
                <td>{license.issueDate.toLocaleDateString()}</td>
                <td>{license.expirationDate.toLocaleDateString()}</td>
                <td>
                  <span className={`status status-${license.status}`}>
                    {license.status}
                  </span>
                </td>
                <td>
                  <button>Edit</button>
                  <button>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LicenseTable;