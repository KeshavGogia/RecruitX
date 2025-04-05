import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    dob: '',
    password: '',
    gender: '',
  });

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await axios.post('http://localhost:8000/user/login', {
        ...loginForm,
        role: 'Recruiter'
      }, { withCredentials: true });
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  const handleRegister = async () => {
    try {
      await axios.post('http://localhost:8000/user/recruiter/addnew', registerForm, { withCredentials: true });
      alert('Registration successful');
      setIsLogin(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Registration failed');
    }
  };

  const handleChange = (e, isForLogin) => {
    const { name, value } = e.target;
    if (isForLogin) {
      setLoginForm({ ...loginForm, [name]: value });
    } else {
      setRegisterForm({ ...registerForm, [name]: value });
    }
  };

  return (
    <div className="login-container">
      <h1>RecruitX</h1>
      <p>Find the best candidates using AI-powered job matching.</p>

      <div className="login-form">
        {isLogin ? (
          <>
            <input
              type="email"
              name="email"
              placeholder="Recruiter Email"
              value={loginForm.email}
              onChange={(e) => handleChange(e, true)}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => handleChange(e, true)}
            />
            <button onClick={handleLogin}>Login</button>
            <p>Don't have an account? <span onClick={() => setIsLogin(false)} style={{ color: 'blue', cursor: 'pointer' }}>Register</span></p>
          </>
        ) : (
          <>
            <input name="firstName" placeholder="First Name" value={registerForm.firstName} onChange={e => handleChange(e, false)} />
            <input name="lastName" placeholder="Last Name" value={registerForm.lastName} onChange={e => handleChange(e, false)} />
            <input name="phone" placeholder="Phone Number" value={registerForm.phone} onChange={e => handleChange(e, false)} />
            <input name="email" type="email" placeholder="Email" value={registerForm.email} onChange={e => handleChange(e, false)} />
            <input name="dob" placeholder="Date of Birth (e.g. 5 Oct 2004)" value={registerForm.dob} onChange={e => handleChange(e, false)} />
            <input name="password" type="password" placeholder="Password" value={registerForm.password} onChange={e => handleChange(e, false)} />
            <input name="gender" placeholder="Gender" value={registerForm.gender} onChange={e => handleChange(e, false)} />
            <button onClick={handleRegister}>Register</button>
            <p>Already have an account? <span onClick={() => setIsLogin(true)} style={{ color: 'blue', cursor: 'pointer' }}>Login</span></p>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
