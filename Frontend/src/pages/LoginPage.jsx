import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Separator } from '../components/ui/separator';

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

  return (
    <section className="flex min-h-screen w-full items-center justify-center py-4 lg:py-20 bg-white">
      <div className="w-full max-w-sm space-y-6">
        <h2 className="mt-6 font-bold text-3xl text-left text-black">Sign in to your account</h2>
        
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
          <div className="space-y-2 text-left">
            <Label htmlFor="password">Password</Label>
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

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox id="rememberMe" className="border-gray-200" />
              <label
                htmlFor="rememberMe"
                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </label>
            </div>

            <a href="#" className="text-sm hover:underline text-black">
              Forgot your password?
            </a>
          </div>

          <div>
            <Button type="submit" disabled={loading} className="w-full bg-[#111111] text-white hover:bg-black rounded-md h-10">
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>

        <div className="space-y-6 lg:mt-10">
          <div className="w-full max-w-sm">
            <div className="relative flex items-center gap-2">
              <Separator className="flex-1 bg-gray-200" />
              <span className="text-muted-foreground shrink-0 text-sm text-gray-500">
                or continue with
              </span>
              <Separator className="flex-1 bg-gray-200" />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <Button type="button" variant="outline" className="w-full border-gray-200 hover:bg-slate-50 h-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                width="20"
                height="20"
                className="text-black mr-2"
              >
                <path d="M12 2a9.96 9.96 0 0 1 6.29 2.226a1 1 0 0 1 .04 1.52l-1.51 1.362a1 1 0 0 1 -1.265 .06a6 6 0 1 0 2.103 6.836l.001 -.004h-3.66a1 1 0 0 1 -.992 -.883l-.007 -.117v-2a1 1 0 0 1 1 -1h6.945a1 1 0 0 1 .994 .89c.04 .367 .061 .737 .061 1.11c0 5.523 -4.477 10 -10 10s-10 -4.477 -10 -10s4.477 -10 10 -10z"></path>
              </svg>
              <span className="font-semibold">Continue with Google</span>
            </Button>
          </div>
          
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
    </section>
  );
}
