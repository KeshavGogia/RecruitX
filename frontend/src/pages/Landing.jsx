import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Landing = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [file, setFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8000/job/listings', { withCredentials: true })
      .then(res => setJobs(res.data))
      .catch(err => alert('Failed to load jobs'));
  }, []);

  const handleApplyClick = (jobId) => {
    setSelectedJob(jobId);
    setShowModal(true);
  };

  const handleApply = async () => {
    if (!file || !selectedJob) return alert('Select a job and upload resume');
    const formData = new FormData();
    formData.append('resume', file);

    try {
      // Step 1: Upload and apply to job
      const res = await axios.post(`http://localhost:8000/job/apply/${selectedJob}`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const resumeURL = res.data.resumeURL;
      const jobObj = jobs.find(job => job.jobNumber === selectedJob);

      // Step 2: AI Evaluation
      const aiRes = await axios.post('http://127.0.0.1:9000/evaluate', {
        resume_url: resumeURL,
        job_description: jobObj.description,
        requirements: jobObj.requirements
      });

      setEvaluationResult(aiRes.data); // store full object

      alert('Applied successfully!');
      setJobs(prev =>
        prev.map(job =>
          job.jobNumber === selectedJob ? { ...job, hasApplied: true } : job
        )
      );
      setShowModal(false);
      setFile(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Error applying');
    }
  };

  return (
    <div className="landing" style={{ padding: '20px' }}>
      <h2>Available Jobs</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
      }}>
        {jobs.map(job => (
          <div key={job.jobNumber} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px' }}>
            <h3>{job.title}</h3>
            <p><strong>Description:</strong> {job.description}</p>
            <p><strong>Location:</strong> {job.location}</p>
            <p><strong>Salary:</strong> ₹{job.salary}</p>
            <p><strong>Requirements:</strong> {Array.isArray(job.requirements) ? job.requirements.join(', ') : job.requirements}</p>
            {job.hasApplied ? (
              <p style={{ color: 'green', fontWeight: 'bold' }}>Already Applied</p>
            ) : (
              <button onClick={() => handleApplyClick(job.jobNumber)}>Apply</button>
            )}
          </div>
        ))}
      </div>

      {/* AI Evaluation Result */}
      {evaluationResult && (
        <div style={{
          marginTop: '30px',
          padding: '20px',
          background: '#f9f9ff',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3>Resume Evaluation Report</h3>
          {evaluationResult.match_percentage && (
            <p><strong>Match Percentage:</strong> {evaluationResult.match_percentage}%</p>
          )}
          {evaluationResult.summary && (
            <p><strong>Summary:</strong> {evaluationResult.summary}</p>
          )}
          {evaluationResult.suggestions && evaluationResult.suggestions.length > 0 && (
            <>
              <p><strong>Suggestions to Improve:</strong></p>
              <ul>
                {evaluationResult.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#fff', padding: '30px', borderRadius: '10px',
            width: '90%', maxWidth: '400px', textAlign: 'center'
          }}>
            <h3>Upload Resume</h3>
            <input type="file" onChange={e => setFile(e.target.files[0])} />
            <div style={{ marginTop: '15px' }}>
              <button onClick={handleApply} style={{ marginRight: '10px' }}>Submit</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
