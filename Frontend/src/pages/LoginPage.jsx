import React from 'react';

export default function LoginPage({ setPage }) {
  return (
    <div className="page-container">
      <h2 style={{ textAlign: 'center', fontSize: '2rem' }}>Welcome Back!</h2>
      <p style={{ textAlign: 'center', color: '#6b7280' }}>
        Don't have an account?{' '}
        <span onClick={() => setPage('signup')} style={{ color: '#4f46e5', cursor: 'pointer', fontWeight: '500' }}>
          Sign Up
        </span>
      </p>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" required />
        </div>
        <button type="submit" className="btn">Login</button>
      </form>
    </div>
  );
}
