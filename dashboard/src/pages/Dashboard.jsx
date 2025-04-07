import React, { useEffect, useState } from 'react';
import axios from 'axios';
import JobApplicants from './JobApplicants';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    salary: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = () => {
    axios.get('http://localhost:8000/job/listings', { withCredentials: true })
      .then(res => setJobs(res.data))
      .catch(() => alert('Failed to fetch jobs'));
  };

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:8000/user/recruiter/logout', { withCredentials: true });
      navigate('/');
    } catch (err) {
      alert('Logout failed');
    }
  };

  const handleAddJob = async () => {
    try {
      await axios.post('http://localhost:8000/job/create', newJob, { withCredentials: true });
      alert('Job created successfully!');
      setShowAddJobModal(false);
      setNewJob({
        title: '',
        description: '',
        requirements: '',
        location: '',
        salary: ''
      });
      fetchJobs();
    } catch (err) {
      alert('Failed to create job');
    }
  };

  return (
    <div className="dashboard-container" style={{ padding: '20px', position: 'relative' }}>
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

      <h2>Your Posted Jobs</h2>
      <button
        onClick={() => setShowAddJobModal(true)}
        style={{
          background: '#4CAF50',
          color: '#fff',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          marginBottom: '20px',
          cursor: 'pointer'
        }}
      >
        Add Job
      </button>

      <div className="job-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {jobs.map(job => (
          <div key={job.jobNumber} className="job-card" style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px' }}>
            <h3>{job.title}</h3>
            <p><strong>Job ID:</strong> {job.jobNumber}</p>
            <p><strong>Location:</strong> {job.location}</p>
            <p><strong>Salary:</strong> ₹{job.salary}</p>
            <button
              onClick={() => setSelectedJobId(job.jobNumber)}
              style={{ marginTop: '10px', padding: '6px 12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}
            >
              View Applicants
            </button>
          </div>
        ))}
      </div>

      {selectedJobId && <JobApplicants jobId={selectedJobId} />}

      {/* Add Job Modal */}
      {showAddJobModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff', padding: '30px', borderRadius: '10px',
            width: '90%', maxWidth: '500px', textAlign: 'center'
          }}>
            <h3>Add New Job</h3>
            <input type="text" placeholder="Title" value={newJob.title}
              onChange={e => setNewJob({ ...newJob, title: e.target.value })}
              style={{ marginBottom: '10px', width: '100%' }} /><br />
            <textarea placeholder="Description" value={newJob.description}
              onChange={e => setNewJob({ ...newJob, description: e.target.value })}
              style={{ marginBottom: '10px', width: '100%' }} /><br />
            <input type="text" placeholder="Requirements (comma separated)" value={newJob.requirements}
              onChange={e => setNewJob({ ...newJob, requirements: e.target.value })}
              style={{ marginBottom: '10px', width: '100%' }} /><br />
            <input type="text" placeholder="Location" value={newJob.location}
              onChange={e => setNewJob({ ...newJob, location: e.target.value })}
              style={{ marginBottom: '10px', width: '100%' }} /><br />
            <input type="text" placeholder="Salary" value={newJob.salary}
              onChange={e => setNewJob({ ...newJob, salary: e.target.value })}
              style={{ marginBottom: '10px', width: '100%' }} /><br />

            <button
              onClick={handleAddJob}
              style={{ backgroundColor: '#4CAF50', color: 'white', padding: '8px 16px', marginRight: '10px', border: 'none', borderRadius: '4px' }}
            >
              Submit
            </button>
            <button
              onClick={() => setShowAddJobModal(false)}
              style={{ backgroundColor: '#ccc', padding: '8px 16px', border: 'none', borderRadius: '4px' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
