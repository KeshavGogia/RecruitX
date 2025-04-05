import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    dob: '',
    password: '',
    gender: ''
  });
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loginUrl = `http://localhost:8000/user/login`;
    const registerUrl = `http://localhost:8000/user/candidate/register`;

    try {
      if (isRegister) {
        await axios.post(registerUrl, form, { withCredentials: true });
        alert('Registered successfully!');
      } else {
        await axios.post(loginUrl, { email: form.email, password: form.password, role: 'Candidate' }, { withCredentials: true });
        alert('Logged in successfully!');
        navigate('/landing');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="login-container">
      <h2>{isRegister ? 'Register' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        {isRegister && (
          <>
            <input name="firstName" type="text" placeholder="First Name" value={form.firstName} onChange={handleChange} required />
            <input name="lastName" type="text" placeholder="Last Name" value={form.lastName} onChange={handleChange} required />
            <input name="phone" type="text" placeholder="Phone" value={form.phone} onChange={handleChange} required />
            <input name="dob" type="text" placeholder="Date of Birth" value={form.dob} onChange={handleChange} required />
            <input name="gender" type="text" placeholder="Gender" value={form.gender} onChange={handleChange} required />
          </>
        )}
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <button type="submit">{isRegister ? 'Register' : 'Login'}</button>
      </form>
      <p onClick={() => setIsRegister(!isRegister)} className="toggle">
        {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
      </p>
    </div>
  );
};

export default Login;
