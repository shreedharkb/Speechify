import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, XCircle, Eye, EyeOff, AudioLines } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useGoogleLogin } from '@react-oauth/google';


export default function LoginPage({ setPage, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null); // { type: 'success' | 'error', message: '' }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setAlertInfo(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        setAlertInfo({ type: 'success', message: 'Login successful' });

        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess(data.user);
          } else {
            setPage(data.user.role === 'teacher' ? 'dashboard' : 'home');
          }
        }, 1000);
      } else {
        const errorData = await response.json();
        setAlertInfo({ type: 'error', message: `Unable to process your request. ${errorData.msg}` });
      }
    } catch (error) {
      setAlertInfo({ type: 'error', message: 'Unable to connect to the server.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    setLoading(true);
    setAlertInfo(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenResponse.credential || tokenResponse.access_token }), // Handle credential if used with standard GoogleLogin or access_token if useGoogleLogin
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        setAlertInfo({ type: 'success', message: 'Google login successful' });

        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess(data.user);
          } else {
            setPage(data.user.role === 'teacher' ? 'dashboard' : 'home');
          }
        }, 1000);
      } else {
        const errorData = await response.json();
        setAlertInfo({ type: 'error', message: errorData.msg });
      }
    } catch (error) {
      setAlertInfo({ type: 'error', message: 'Unable to connect to the server.' });
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: tokenResponse => handleGoogleSuccess(tokenResponse),
    onError: () => setAlertInfo({ type: 'error', message: 'Google Login Failed' })
  });

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row bg-white">
        {/* Left part: Image */}
        <div className="relative hidden md:flex md:w-1/2 bg-muted items-center justify-center overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=3542&auto=format&fit=crop"
            alt="Image"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 flex flex-col items-center text-center p-8">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg mb-6">
              <AudioLines className="w-10 h-10 text-white" />
            </div>
            <h1 className="font-bold text-4xl text-white tracking-tight">Speechify</h1>
            <p className="mt-4 text-lg text-white/80">Your ultimate platform for learning and teaching.</p>
          </div>
        </div>

        {/* Right part: Form */}
        <div className="relative p-6 md:p-10 md:w-1/2 flex flex-col justify-center items-center w-full bg-gradient-to-br from-white via-[oklch(97%_0.01_60.8)] to-[oklch(94%_0.03_60.8)] overflow-hidden">
          {/* Decorative background glow */}
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[oklch(61%_0.09_60.8)]/15 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-100/40 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 w-full max-w-sm mx-auto space-y-6">
            <div className="md:hidden flex flex-col items-center justify-center space-y-4 mb-4">
              <div className="w-16 h-16 bg-[oklch(61%_0.09_60.8)] rounded-full flex items-center justify-center shadow-lg">
                <AudioLines className="w-10 h-10 text-white" />
              </div>
              <h1 className="font-bold text-4xl text-[#0f172a] tracking-tight">Speechify</h1>
            </div>
            <h2 className="font-bold text-2xl text-center text-black">Sign in to your account</h2>

        {alertInfo && (
          <Alert variant={alertInfo.type === 'error' ? 'destructive' : 'success'} className="bg-white shadow-sm">
            {alertInfo.type === 'error' ? (
              <XCircle className="h-5 w-5" />
            ) : (
              <CheckCircle2 className="h-5 w-5" />
            )}
            <AlertTitle>{alertInfo.type === 'error' ? 'Error' : 'Success'}</AlertTitle>
            <AlertDescription>{alertInfo.message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 text-left">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 border-gray-200"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <button
                type="button"
                onClick={() => setPage('forgot-password')}
                className="text-sm font-medium text-black hover:text-gray-800"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 pr-10 border-gray-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <Button type="submit" disabled={loading} className="w-full bg-[#111111] text-white hover:bg-black rounded-md h-10">
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>

        <div className="relative flex items-center my-6">
          <div className="flex-grow border-t border-gray-200/80"></div>
          <span className="flex-shrink-0 px-4 text-sm text-gray-500">Or continue with</span>
          <div className="flex-grow border-t border-gray-200/80"></div>
        </div>

        <div className="flex justify-center w-full">
          <Button
            type="button"
            variant="outline"
            onClick={() => loginWithGoogle()}
            className="w-full h-10 border-gray-200 text-black hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
              </g>
            </svg>
            Sign in with Google
          </Button>
        </div>

        <div className="space-y-6 lg:mt-10">

          <p className="mt-8 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); setPage('role-selection'); }}
              className="font-semibold leading-6 text-black hover:text-gray-800"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
  );
}
