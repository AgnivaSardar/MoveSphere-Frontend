import React, { useState } from 'react';
import axios from 'axios';
import '../styles/style.css';

const SignUp = () => {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const criteria = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const isStrongPassword = Object.values(criteria).every(Boolean);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!isStrongPassword) {
      setError('Password does not meet criteria');
      return;
    }

    setLoading(true);
    try {
      // Notice no /api prefix here because API_BASE_URL excludes it
      await axios.post(`${API_BASE_URL}/api/auth/send-otp`, { email, phone });
      setStep(2);
    } catch {
      setError('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, {
        email,
        phone,
        otp,
        fullName,
        password,
      });
      if (res.data.success) {
        alert('Signup successful! Please login.');
        setStep(1);
        setFullName('');
        setEmail('');
        setPhone('');
        setPassword('');
        setConfirmPassword('');
        setOtp('');
      } else {
        setError('Invalid OTP');
      }
    } catch {
      setError('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-form">
      {step === 1 ? (
        <>
          <h2>Sign Up</h2>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <form onSubmit={handleSignup} noValidate>
            <input
              type="text"
              placeholder="Full Name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="tel"
              placeholder="Phone Number"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <div className="password-criteria">
              <p>Password must contain:</p>
              <ul>
                <li style={{ color: criteria.length ? 'green' : 'red' }}>At least 8 characters</li>
                <li style={{ color: criteria.uppercase ? 'green' : 'red' }}>At least 1 uppercase letter</li>
                <li style={{ color: criteria.number ? 'green' : 'red' }}>At least 1 number</li>
                <li style={{ color: criteria.special ? 'green' : 'red' }}>At least 1 special character</li>
              </ul>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Sign Up'}
            </button>
          </form>
        </>
      ) : (
        <>
          <h2>Verify OTP</h2>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <form onSubmit={handleOtpVerify} noValidate>
            <input
              type="text"
              placeholder="Enter OTP"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        </>
      )}
    </section>
  );
};

export default SignUp;
