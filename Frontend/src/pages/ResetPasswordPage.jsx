import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { AlertCircle, CheckCircle2, Eye, EyeOff, AudioLines } from 'lucide-react';

export default function ResetPasswordPage({ setPage }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');

  // Extract token and email from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    const emailParam = urlParams.get('email');
    
    if (tokenParam && emailParam) {
      setToken(tokenParam);
      setEmail(emailParam);
    } else {
      setAlertInfo({ type: 'error', message: 'Invalid or missing reset token.' });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setAlertInfo({ type: 'error', message: 'Please fill in all fields.' });
      return;
    }

    if (password !== confirmPassword) {
      setAlertInfo({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    if (password.length < 6) {
      setAlertInfo({ type: 'error', message: 'Password must be at least 6 characters long.' });
      return;
    }

    setLoading(true);
    setAlertInfo(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, token, newPassword: password }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlertInfo({ type: 'success', message: 'Password reset successful! Redirecting to login...' });
        setTimeout(() => {
          setPage('login');
        }, 2000);
      } else {
        setAlertInfo({ type: 'error', message: data.msg || 'Something went wrong' });
      }
    } catch (error) {
      setAlertInfo({ type: 'error', message: 'Unable to connect to the server.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center py-4 lg:py-20 bg-gradient-to-br from-white via-[oklch(97%_0.01_60.8)] to-[oklch(94%_0.03_60.8)] overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[oklch(61%_0.09_60.8)]/15 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-100/40 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm space-y-6">
        
        {/* Logo */}
        <div className="flex justify-center mb-6 cursor-pointer" onClick={() => setPage('home')}>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-[oklch(61%_0.09_60.8)] rounded-full flex items-center justify-center shadow-lg">
              <AudioLines className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-[#0f172a] tracking-tight">Speechify</span>
          </div>
        </div>

        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create new password</h1>
          <p className="text-sm text-slate-500">
            Your new password must be different from previous used passwords.
          </p>
        </div>

        {alertInfo && (
          <Alert variant={alertInfo.type === 'error' ? 'destructive' : 'default'} className={alertInfo.type === 'success' ? 'border-green-500 text-green-700 bg-green-50' : ''}>
            {alertInfo.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" color="#22c55e" />}
            <AlertTitle>{alertInfo.type === 'error' ? 'Error' : 'Success'}</AlertTitle>
            <AlertDescription>{alertInfo.message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || !token}
                className="pr-10 border-gray-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading || !token}
                className="pr-10 border-gray-200"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading || !token} className="w-full h-10 bg-[#111111] text-white hover:bg-black rounded-md mt-4">
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      </div>
    </section>
  );
}
