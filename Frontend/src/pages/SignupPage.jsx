import React from 'react';

export default function SignupPage({ setPage }) {
  return (
    <div className="page-container">
      <h2 style={{ textAlign: 'center', fontSize: '2rem' }}>Create Account</h2>
      <p style={{ textAlign: 'center', color: '#6b7280' }}>
        Already have an account?{' '}
        <span onClick={() => setPage('login')} style={{ color: '#4f46e5', cursor: 'pointer', fontWeight: '500' }}>
          Login
        </span>
      </p>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="form-group">
          <label>Full Name</label>
          <input type="text" required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" required />
        </div>
        <button type="submit" className="btn">Create Account</button>
      </form>
    </div>
  );
}
