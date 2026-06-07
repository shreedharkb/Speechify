import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Eye, EyeOff, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';

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

  const handleGoogleAuth = () => {
    setAlertInfo({ type: 'warning', message: 'Google authentication flow is not yet implemented.' });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
        {/* Logo */}
        <div className="flex justify-center mb-6 cursor-pointer" onClick={() => setPage('home')}>
          <div className="flex items-center gap-2.5">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 6L16 30L30 6H2Z" fill="#0f172a"/>
              <path d="M18 8L11 17H16.5L14 26L23 15H17.5L18 8Z" fill="#ffffff"/>
            </svg>
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
  );
}
