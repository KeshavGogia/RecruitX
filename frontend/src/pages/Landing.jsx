import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [file, setFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEvaluateModal, setShowEvaluateModal] = useState(false);
  const [evaluateFile, setEvaluateFile] = useState(null);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:8000/job/listings', { withCredentials: true })
      .then(res => setJobs(res.data))
      .catch(err => alert('Failed to load jobs'));
  }, []);

  const handleApplyClick = (jobId) => {
    setSelectedJob(jobId);
    setShowModal(true);
  };

  const handleEvaluateClick = (jobId) => {
    setSelectedJob(jobId);
    setShowEvaluateModal(true);
    setEvaluateFile(null);
    setEvaluationResult(null);
  };

  const handleApply = async () => {
    if (!file || !selectedJob) return alert('Please select a job and upload your resume');
    const formData = new FormData();
    formData.append('resume', file);

    try {
      await axios.post(`http://localhost:8000/job/apply/${selectedJob}`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Your resume has been submitted successfully!');
      setJobs(prev =>
        prev.map(job =>
          job.jobNumber === selectedJob ? { ...job, hasApplied: true } : job
        )
      );
      setShowModal(false);
      setFile(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Error submitting resume');
    }
  };

  const handleEvaluate = async () => {
    if (!evaluateFile || !selectedJob) return alert('Please select a file');

    const formData = new FormData();
    formData.append('resume', evaluateFile);
    formData.append('job_number', selectedJob);

    try {
      const res = await axios.post('http://127.0.0.1:9000/evaluate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setEvaluationResult(res.data);
    } catch (err) {
      console.error(err);
      setEvaluationResult({ error: 'Error during evaluation.' });
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:8000/user/candidate/logout', { withCredentials: true });
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Logout failed');
    }
  };

  return (
    <div className="landing" style={{ padding: '20px', position: 'relative' }}>
      <button
        onClick={handleLogout}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: '#ff4d4d',
          color: '#fff',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Logout
      </button>

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
            <button onClick={() => handleEvaluateClick(job.jobNumber)} style={{ marginLeft: '10px' }}>Evaluate</button>
          </div>
        ))}
      </div>

      {/* Apply Modal */}
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

      {/* Evaluate Modal */}
      {showEvaluateModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#fff', padding: '30px', borderRadius: '10px',
            width: '90%', maxWidth: '500px', textAlign: 'center'
          }}>
            <h3>Evaluate Resume</h3>
            <input type="file" onChange={e => setEvaluateFile(e.target.files[0])} />
            <div style={{ marginTop: '15px' }}>
              <button onClick={handleEvaluate} style={{ marginRight: '10px' }}>Submit</button>
              <button onClick={() => {
                setShowEvaluateModal(false);
                setEvaluationResult(null);
              }}>Cancel</button>
            </div>

            {evaluationResult && (
              <div style={{ marginTop: '20px', textAlign: 'left' }}>
                {evaluationResult.error ? (
                  <p style={{ color: 'red' }}>{evaluationResult.error}</p>
                ) : (
                  <>
                    <p><strong>Shortlisting Score:</strong> {evaluationResult.shortlisting_score}</p>
                    <p><strong>Matched Keywords:</strong> {evaluationResult.matched_keywords?.join(', ')}</p>
                    <p><strong>Missing Keywords:</strong> {evaluationResult.missing_keywords?.join(', ')}</p>
                    <p><strong>Resume Improvements:</strong></p>
                    <ul>
                      {evaluationResult.resume_improvements?.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                    <p><strong>Summary Feedback:</strong> {evaluationResult.summary_feedback}</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
