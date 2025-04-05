import React, { useEffect, useState } from 'react';
import axios from 'axios';

const JobApplicants = ({ jobId }) => {
  const [applicants, setApplicants] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:8000/job/applicants/${jobId}`, { withCredentials: true })
      .then(res => setApplicants(res.data))
      .catch(() => alert('Failed to fetch applicants'));
  }, [jobId]);

  return (
    <div className="applicants-container">
      <h3>Applicants for Job #{jobId}</h3>
      {applicants.length === 0 ? (
        <p>No applicants yet.</p>
      ) : (
        <table className="applicants-table">
          <thead>
            <tr>
              <th>S. No.</th>
              <th>Name</th>
              <th>Email</th>
              <th>Resume</th>
            </tr>
          </thead>
          <tbody>
            {applicants.map((app, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{app.firstName + " " + app.lastName}</td>
                <td>{app.email}</td>
                <td>
                  <a href={app.resumeURL} target="_blank" rel="noopener noreferrer">
                    View Resume
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default JobApplicants;
