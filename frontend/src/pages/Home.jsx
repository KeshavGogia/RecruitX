// src/pages/Home.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="home">
      <header>
        <h1>Welcome to RecruitX</h1>
        <button onClick={() => navigate('/login')}>Login</button>
      </header>
      <div className="about">
        <div className="about-section left">
          <img src="../img1.jpg" alt="About Us Left" />
          <p>We are transforming recruitment with cutting-edge AI technology.</p>
        </div>
        <div className="about-section right">
          <img src="assets/img2.jpg" alt="About Us Right" />
          <p>RecruitX connects top candidates to the best jobs faster and smarter.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
