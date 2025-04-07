import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './popup.css';

const JobApplicants = ({ jobId }) => {
  const [applicants, setApplicants] = useState(null); // null means "not loaded yet"
  const [summaryResults, setSummaryResults] = useState([]);
  const [showSummaryPopup, setShowSummaryPopup] = useState(false);

  useEffect(() => {
    axios
      .get(`http://localhost:8000/job/applicants/${jobId}`, { withCredentials: true })
      .then((res) => {
        setApplicants(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        alert('Failed to fetch applicants');
        setApplicants([]);
      });
  }, [jobId]);

  const handleSummarise = async () => {
    try {
      const res = await axios.post(
        'http://127.0.0.1:9000/recruiter/evaluate',
        { job_number: jobId },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setSummaryResults(res.data.results || []);
      setShowSummaryPopup(true);
    } catch (err) {
      alert('Failed to summarise.');
    }
  };

  return (
    <div className="applicants-container">
      <h3>Applicants for Job #{jobId}</h3>

      {applicants === null ? (
        <p>Loading applicants...</p>
      ) : applicants.length === 0 ? (
        <p>No applicants yet.</p>
      ) : (
        <>
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
                  <td>{app.firstName} {app.lastName}</td>
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
          <button className="summarise-btn" onClick={handleSummarise}>
            Summarise
          </button>
        </>
      )}

      {showSummaryPopup && summaryResults.length > 0 && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Evaluation Summary</h2>
            {summaryResults.map((result, idx) => (
              <div key={idx} className="summary-card">
                <h3>{result.applicant.firstName} {result.applicant.lastName}</h3>
                <p><strong>Matching Score:</strong> {result.analysis.shortlisting_score}%</p>
                <p><strong>Feedback:</strong> {result.analysis.summary_feedback}</p>
              </div>
            ))}
            <button onClick={() => setShowSummaryPopup(false)} className="close-btn">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApplicants;
