import React from 'react';

export default function Footer() {
  const footerStyle = {
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
    textAlign: 'center',
    padding: '1.5rem',
    marginTop: 'auto', // Pushes footer to the bottom
    borderTop: '1px solid #e5e7eb'
  };

  return (
    <footer style={footerStyle}>
      <p>&copy; {new Date().getFullYear()} QuizMaster. All rights reserved.</p>
    </footer>
  );
}
