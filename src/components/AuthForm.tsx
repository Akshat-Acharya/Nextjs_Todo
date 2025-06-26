'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setToken } from '../redux/slices/authSlice';
import { AppDispatch } from '../redux/store';
import axios from 'axios';
import { z } from 'zod';
import toast from 'react-hot-toast'; // Import toast for notifications

import { Mail, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

// Define the Zod schema for authentication data
const authSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function AuthForm() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // State to store field-specific validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({}); 

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({}); // Clear previous field errors

    try {
      // Validate inputs using Zod schema
      authSchema.parse({ email, password });
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Map Zod errors to a fieldErrors object
        const errors: Record<string, string> = {};
        err.errors.forEach(e => {
          if (e.path.length > 0 && typeof e.path[0] === 'string') {
            errors[e.path[0]] = e.message;
          }
        });
        setFieldErrors(errors);
        toast.error('Please correct the errors in the form.'); // General toast for validation issues
        return; // Stop submission if validation fails
      }
    }

    setLoading(true);
    const endpoint = mode === 'login' ? '/api/login' : '/api/signup';

    try {
      const response = await axios.post(endpoint, { email, password ,rememberMe});

      if (mode === 'login') {
        dispatch(setToken(response.data.token));
        toast.success('Logged in successfully!'); // Toast for successful login
        router.refresh(); // Refresh to trigger layout changes if token is used there
        router.push('/'); // Or wherever your main app dashboard is
      } else {
        toast.success('Account created successfully! Please log in.'); // Toast for successful signup
        setMode('login'); // Automatically switch to login mode after signup
        setEmail('');
        setPassword('');
      }
    } catch (err: any) {
      // Use toast for API errors
      const errorMessage = err.response?.data?.error || 'An unexpected error occurred.';
      toast.error(errorMessage);
      console.error('Auth API Error:', err); // Log full error for debugging
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setFieldErrors({}); // Clear errors when toggling mode
    setEmail('');
    setPassword('');
  };

  return (
    <>
      <div className="flex items-center justify-center w-full min-h-screen bg-slate-50">
        <Card className="w-full max-w-md border-gray-200 shadow-sm animate-fadeIn">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">
              {mode === 'login' ? 'Log in' : 'Create an account'}
            </CardTitle>
            <CardDescription>
              {mode === 'login'
                ? "Don't have an account? "
                : 'Already have an account? '}
              <button
                type="button"
                onClick={toggleMode}
                className="font-medium text-primary hover:underline focus:outline-none"
              >
                {mode === 'login' ? 'Sign Up' : 'Log In'}
              </button>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => {
                      setEmail(e.target.value);
                      // Clear error for this field as user types
                      setFieldErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.email; // Explicitly delete the property
                        return newErrors;
                      });
                    }} 
                    placeholder="email@example.com" 
                    className="pl-10" 
                  />
                </div>
                {/* Display email field error */}
                {fieldErrors.email && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.email}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type={showPass ? 'text' : 'password'} 
                    value={password} 
                    onChange={(e) => {
                      setPassword(e.target.value);
                      // Clear error for this field as user types
                      setFieldErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.password; // Explicitly delete the property
                        return newErrors;
                      });
                    }} 
                    placeholder="••••••••" 
                    className="pl-10 pr-10" 
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPass ? <EyeOff size={18} className='cursor-pointer'/> : <Eye size={18}  className='cursor-pointer'/>}
                  </button>
                </div>
                {/* Display password field error */}
                {fieldErrors.password && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.password}</p>
                )}
              </div>
              {mode === 'login' && (
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember-me" 
                    className='cursor-pointer'
                    checked={rememberMe} 
                    onCheckedChange={(checked) => setRememberMe(!!checked)} 
                  />
                  <Label htmlFor="remember-me" className="text-sm font-normal">Remember me</Label>
                </div>
              )}
              <Button type="submit" className="w-full cursor-pointer" disabled={loading} >
                {loading ? 'Processing...' : mode === 'login' ? 'Login' : 'Create Account'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
