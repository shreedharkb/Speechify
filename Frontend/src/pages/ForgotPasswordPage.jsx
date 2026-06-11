import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { AlertCircle, CheckCircle2, ArrowLeft, AudioLines } from 'lucide-react';

export default function ForgotPasswordPage({ setPage }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setAlertInfo({ type: 'error', message: 'Please enter your email address' });
      return;
    }

    setLoading(true);
    setAlertInfo(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlertInfo({ type: 'success', message: data.msg });
        setEmail('');
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Reset Password</h1>
          <p className="text-sm text-slate-500">
            Enter your email and we'll send you a link to reset your password.
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="border-gray-200"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-10 bg-[#111111] text-white hover:bg-black rounded-md">
            {loading ? 'Sending...' : 'Send reset link'}
          </Button>
        </form>

        <div className="text-center pt-4">
          <button 
            onClick={() => setPage('login')} 
            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </button>
        </div>
      </div>
    </section>
  );
}
