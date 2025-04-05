import React, { useEffect, useState } from 'react';
import axios from 'axios';
import JobApplicants from './JobApplicants';

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8000/job/listings', { withCredentials: true })
      .then(res => setJobs(res.data))
      .catch(() => alert('Failed to fetch jobs'));
  }, []);

  return (
    <div className="dashboard-container">
      <h2>Your Posted Jobs</h2>
      <div className="job-grid">
        {jobs.map(job => (
          <div key={job.jobNumber} className="job-card">
            <h3>{job.title}</h3>
            <p><strong>Job ID:</strong> {job.jobNumber}</p>
            <p><strong>Location:</strong> {job.location}</p>
            <p><strong>Salary:</strong> ₹{job.salary}</p>
            <button onClick={() => setSelectedJobId(job.jobNumber)}>View Applicants</button>
          </div>
        ))}
      </div>
      {selectedJobId && <JobApplicants jobId={selectedJobId} />}
    </div>
  );
};

export default Dashboard;
