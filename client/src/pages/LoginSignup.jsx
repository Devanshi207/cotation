// src/pages/LoginSignup.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/logo.png'; // Make sure the path is correct

function LoginSignup() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, signup } = useContext(AuthContext);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await signup(form.name, form.email, form.password);
      }
      navigate('/'); // Redirect to homepage after login/signup
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.msg || `${isLogin ? 'Login' : 'Signup'} failed`
      );
    }
  };

  return (
    <div style={outerWrapper}>
      <div style={cardStyle}>
        {/* Header Row: logo LEFT, title CENTRE, invisible spacer RIGHT */}
        <div style={headerRow}>
          <img src={logo} alt="Logo" style={logoStyle} />
          <h2 style={titleStyle}>{isLogin ? 'Login' : 'Signup'}</h2>
          <div style={spacer}></div>
        </div>

        {error && <p style={errorStyle}>{error}</p>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          <button type="submit" style={buttonStyle}>
            {isLogin ? 'Login' : 'Signup'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '15px' }}>
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button onClick={() => setIsLogin(!isLogin)} style={linkButton}>
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
}

/* ───── Styles ───── */
const outerWrapper = {
  minHeight: '100vh',
  backgroundColor: '#f4fafd',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '20px',
};

const cardStyle = {
  maxWidth: '400px',
  width: '100%',
  padding: '30px',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
};

const headerRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '25px',
};

const logoStyle = {
  height: '50px',
};

const spacer = {
  width: '50px',
};

const titleStyle = {
  flexGrow: 1,
  textAlign: 'center',
  fontSize: '26px',
  fontWeight: 600,
  color: '#333',
  margin: 0,
};

const errorStyle = {
  color: 'red',
  textAlign: 'center',
  marginBottom: '15px',
  fontSize: '14px',
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  marginBottom: '15px',
  fontSize: '15px',
  borderRadius: '8px',
  border: '1px solid #ccc',
};

const buttonStyle = {
  width: '100%',
  padding: '12px',
  fontSize: '16px',
  backgroundColor: '#74bbbd',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'background 0.3s',
};

const linkButton = {
  background: 'none',
  border: 'none',
  color: '#007bff',
  textDecoration: 'underline',
  cursor: 'pointer',
  fontSize: '14px',
};

export default LoginSignup;
