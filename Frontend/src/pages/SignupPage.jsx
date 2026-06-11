import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Eye, EyeOff, AlertCircle, CheckCircle2, XCircle, AudioLines } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { useGoogleLogin } from '@react-oauth/google';

export default function SignupPage({ setPage }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  
  // Academic fields
  const [rollNo, setRollNo] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('1');
  const [semester, setSemester] = useState('1');

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null); // { type: 'success' | 'error', message: '' }

  // Password validation logic
  const getPasswordErrors = (pwd) => {
    if (!pwd) return [];
    const errors = [];
    if (pwd.length < 8) errors.push('Minimum 8 characters');
    if (!/[A-Z]/.test(pwd)) errors.push('At least one uppercase letter');
    if (!/[a-z]/.test(pwd)) errors.push('At least one lowercase letter');
    return errors;
  };

  const passwordErrors = getPasswordErrors(password);

  // Get the selected role from localStorage if it exists
  useEffect(() => {
    const selectedRole = localStorage.getItem('selectedRole');
    if (selectedRole) {
      setRole(selectedRole);
    } else {
      // If no role selected, redirect to role selection
      setPage('role-selection');
    }
  }, [setPage]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (passwordErrors.length > 0) {
      setAlertInfo({ type: 'error', message: 'Unable to process. Password does not meet requirements.' });
      return;
    }

    setLoading(true);
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      
      const payload = { 
        name: fullName, 
        email, 
        password, 
        role,
        branch 
      };

      if (role === 'student') {
        payload.rollNo = rollNo;
        payload.year = year;
        payload.semester = semester;
      } else {
        payload.department = branch;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setAlertInfo({ type: 'success', message: 'Registration successful! Redirecting to login...' });
        setTimeout(() => setPage('login'), 1500);
      } else {
        const errorData = await response.json();
        setAlertInfo({ type: 'error', message: `Registration failed: ${errorData.msg}` });
      }
    } catch (error) {
      console.error('There was a network error during registration:', error);
      setAlertInfo({ type: 'error', message: 'Registration failed. Could not connect to the server.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    setLoading(true);
    setAlertInfo(null);
    try {
      const payload = { 
        token: tokenResponse.credential || tokenResponse.access_token, 
        role,
        branch,
      };

      if (role === 'student') {
        payload.rollNo = rollNo;
        payload.year = year;
        payload.semester = semester;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        setAlertInfo({ type: 'success', message: 'Google authentication successful! Redirecting...' });

        setTimeout(() => {
          setPage(data.user.role === 'teacher' ? 'dashboard' : 'home');
        }, 1500);
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

  const signupWithGoogle = useGoogleLogin({
    onSuccess: tokenResponse => handleGoogleSuccess(tokenResponse),
    onError: () => setAlertInfo({ type: 'error', message: 'Google Signup Failed' })
  });

  return (
    <section className="relative flex flex-col min-h-screen w-full justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-[oklch(97%_0.01_60.8)] to-[oklch(94%_0.03_60.8)] overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[oklch(61%_0.09_60.8)]/15 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-100/40 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full">
        <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
          {/* Logo */}
        <div className="flex justify-center mb-6 cursor-pointer" onClick={() => setPage('home')}>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-[oklch(61%_0.09_60.8)] rounded-full flex items-center justify-center shadow-lg">
              <AudioLines className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-[#0f172a] tracking-tight">Speechify</span>
          </div>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
        <div className="py-8 px-4 sm:px-10">
          
          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* Section 1: Personal Information */}
            <div>
              <div className="mb-6 pb-4">
                <h2 className="font-bold text-2xl text-left text-black">
                  {role === 'teacher' ? 'Teacher Registration' : 'Student Registration'}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Let's get you set up with your {role} account.
                </p>
              </div>

              {/* Alert Message */}
              {alertInfo && (
                <Alert variant={alertInfo.type === 'error' ? 'destructive' : alertInfo.type === 'warning' ? 'warning' : 'success'} className="mb-6 bg-white shadow-sm">
                  {alertInfo.type === 'error' ? (
                    <XCircle className="h-5 w-5" />
                  ) : alertInfo.type === 'warning' ? (
                    <AlertCircle className="h-5 w-5" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5" />
                  )}
                  <AlertTitle>{alertInfo.type === 'error' ? 'Error' : alertInfo.type === 'warning' ? 'Notice' : 'Success'}</AlertTitle>
                  <AlertDescription>{alertInfo.message}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First name</Label>
                  <Input
                    id="first-name"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last-name">Last name</Label>
                  <Input
                    id="last-name"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="border-gray-200"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-gray-200"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10 border-gray-200"
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
                  {/* Password Requirements */}
                  {password.length > 0 && passwordErrors.length > 0 && (
                    <Alert variant="destructive" className="mt-3 bg-white shadow-sm border-gray-200 text-black [&>svg]:text-red-600">
                      <AlertCircle className="h-5 w-5" />
                      <AlertTitle>Password does not meet requirements:</AlertTitle>
                      <AlertDescription>
                        <ul className="mt-2 ml-1 list-disc text-sm text-gray-500 space-y-1">
                          <li className={password.length >= 8 ? "text-gray-400 line-through" : ""}>Minimum 8 characters</li>
                          <li className={/[A-Z]/.test(password) ? "text-gray-400 line-through" : ""}>At least one uppercase letter</li>
                          <li className={/[a-z]/.test(password) ? "text-gray-400 line-through" : ""}>At least one lowercase letter</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Academic Profile */}
            <div>
              <div className="mb-6 pb-4">
                <h2 className="font-bold text-2xl text-left text-black">Academic Profile</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Information regarding your academic status and affiliation.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                {role === 'student' && (
                  <>
                    <div className="sm:col-span-2 space-y-2">
                      <Label htmlFor="rollNo">Roll Number</Label>
                      <Input
                        id="rollNo"
                        required
                        value={rollNo}
                        onChange={(e) => setRollNo(e.target.value)}
                        placeholder="e.g. 12345678"
                        className="border-gray-200"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="year">Year</Label>
                      <Select value={year} onValueChange={setYear}>
                        <SelectTrigger id="year" className="border-gray-200">
                          <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1st Year</SelectItem>
                          <SelectItem value="2">2nd Year</SelectItem>
                          <SelectItem value="3">3rd Year</SelectItem>
                          <SelectItem value="4">4th Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="semester">Semester</Label>
                      <Select value={semester} onValueChange={setSemester}>
                        <SelectTrigger id="semester" className="border-gray-200">
                          <SelectValue placeholder="Select Semester" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Semester 1</SelectItem>
                          <SelectItem value="2">Semester 2</SelectItem>
                          <SelectItem value="3">Semester 3</SelectItem>
                          <SelectItem value="4">Semester 4</SelectItem>
                          <SelectItem value="5">Semester 5</SelectItem>
                          <SelectItem value="6">Semester 6</SelectItem>
                          <SelectItem value="7">Semester 7</SelectItem>
                          <SelectItem value="8">Semester 8</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {role === 'teacher' && (
                  <div className="sm:col-span-2 space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select value={branch} onValueChange={setBranch}>
                      <SelectTrigger id="department" className="border-gray-200">
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CSE">CSE</SelectItem>
                        <SelectItem value="ECE">ECE</SelectItem>
                        <SelectItem value="DSAI">DSAI</SelectItem>
                        <SelectItem value="Arts & Humanities">Arts & Humanities</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {role === 'student' && (
                  <div className="sm:col-span-2 space-y-2">
                    <Label htmlFor="branch">Branch</Label>
                    <Select value={branch} onValueChange={setBranch}>
                      <SelectTrigger id="branch" className="border-gray-200">
                        <SelectValue placeholder="Select Branch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CSE">CSE</SelectItem>
                        <SelectItem value="ECE">ECE</SelectItem>
                        <SelectItem value="DSAI">DSAI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-4">
              <Button type="submit" className="w-full h-10 bg-[#111111] text-white hover:bg-black rounded-md" disabled={loading || passwordErrors.length > 0}>
                {loading ? 'Creating account...' : 'Create account'}
              </Button>

              <div className="relative flex items-center my-6">
                <div className="flex-grow border-t border-gray-200/80"></div>
                <span className="flex-shrink-0 px-4 text-sm text-gray-500">Or signup with</span>
                <div className="flex-grow border-t border-gray-200/80"></div>
              </div>

              <div className="flex justify-center w-full">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => signupWithGoogle()}
                  className="w-full h-10 border-gray-200 text-black hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                    </g>
                  </svg>
                  Sign up with Google
                </Button>
              </div>
            </div>

          </form>
          
          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => setPage('login')}
              className="font-semibold leading-6 text-black hover:text-gray-800"
            >
              Sign in
            </button>
          </p>

        </div>
      </div>
      </div>
    </section>
  );
}
