import React, { useState, useEffect } from 'react';

export default function SignupPage({ setPage }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');

  // Get the selected role from localStorage if it exists
  useEffect(() => {
    const selectedRole = localStorage.getItem('selectedRole');
    if (selectedRole) {
      setRole(selectedRole);
      // Clear the stored role after using it
      localStorage.removeItem('selectedRole');
    }
  }, []);

  const handleSubmit = async (event) => {
  // This alert is our checkpoint. If you don't see this, the function is not being called.
  alert("Sign Up button was clicked and handleSubmit is running!");
    // 1. Prevent the page from reloading.
    event.preventDefault();

    try {
      // 2. Make the API call to the backend.
      // Use the role from state (either from localStorage or default 'student')
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      // 3. Check the response.
      if (response.ok) {
        alert('Registration successful! Please log in.');
        setPage('login');
      } else {
        const errorData = await response.json();
        alert(`Registration failed: ${errorData.msg}`);
      }
    } catch (error) {
      console.error('There was a network error during registration:', error);
      alert('Registration failed. Could not connect to the server. Is the backend running?');
    }
  };

  return (
    <div className="page-container">
      <div className="form-window">
        <h1>Create an Account</h1>
        <p style={{ textAlign: 'center', color: 'var(--muted-text-color)', marginBottom: '1.5rem' }}>
          You're signing up as a <strong>{role === 'teacher' ? 'Teacher' : 'Student'}</strong>
        </p>
        {/*
          CRUCIAL PART 1: The `onSubmit` event on the form tag
          is what triggers our function.
        */}
        <form className="form-container" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">I am a</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>
          {/*
            CRUCIAL PART 2: The button MUST have `type="submit"`
            to trigger the form's `onSubmit` event.
          */}
          <button type="submit" className="btn">Sign Up</button>
        </form>
        <p>
          Already have an account?{' '}
          <a href="#" onClick={() => setPage('login')}>
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}

