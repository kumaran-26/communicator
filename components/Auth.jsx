import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';
import { Lock, Mail, User, Eye, EyeOff, ArrowRight, MessageSquare } from 'lucide-react';

const Auth = ({ isRegister }) => {
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isRegister) {
      let score = 0;
      if (password.length > 5) score += 1;
      if (password.length > 8) score += 1;
      if (/[A-Z]/.test(password)) score += 1;
      if (/[0-9]/.test(password)) score += 1;
      if (/[^A-Za-z0-9]/.test(password)) score += 1;
      setPasswordStrength(score); // Max 5
    }
  }, [password, isRegister]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (isRegister) {
        await register(username, email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
      if (password.length === 0) return '';
      if (passwordStrength <= 2) return 'Weak';
      if (passwordStrength <= 3) return 'Medium';
      return 'Strong';
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Image & Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-violet-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-violet-900/80 z-10"></div>
        <img 
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Team Collaboration" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
        />
        <div className="relative z-20 max-w-lg px-8 text-center text-white">
            <div className="mb-6 flex justify-center animate-fade-in-down">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
                   <MessageSquare size={40} className="text-white" />
                </div>
            </div>
            <h1 className="text-5xl font-bold mb-4 tracking-tight">KiteHub</h1>
            <p className="text-violet-100 text-xl leading-relaxed font-light">
                Connect with your team in real-time. Secure messaging, presence tracking, and instant delivery status.
            </p>
        </div>
        
        {/* Abstract Shapes */}
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 lg:bg-white">
        <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:text-left">
                 {/* Mobile Branding */}
                 <div className="lg:hidden flex flex-col items-center justify-center mb-6">
                    <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg mb-2">
                        <MessageSquare className="text-white w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">KiteHub</h1>
                </div>

                <h2 className="text-3xl font-bold text-gray-900">{isRegister ? 'Create an account' : 'Welcome to KiteHub'}</h2>
                <p className="mt-2 text-gray-500">
                    {isRegister ? 'Join your team workspace today.' : 'Please enter your details to sign in.'}
                </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-start">
                 <div className="mr-2 mt-0.5">•</div>
                 {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {isRegister && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all shadow-sm text-black"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all shadow-sm text-black"
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all shadow-sm text-black"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {/* Password Strength Meter */}
                {isRegister && password.length > 0 && (
                    <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500">Security Check</span>
                            <span className={`text-xs font-bold uppercase tracking-wide ${
                                passwordStrength <= 2 ? 'text-red-500' : 
                                passwordStrength <= 3 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                                {getStrengthText()}
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-500 ease-out ${getStrengthColor()}`} 
                                style={{ width: `${(passwordStrength / 5) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                )}
              </div>

              <div className="pt-2">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-violet-200 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:scale-[1.01]"
                >
                    {isLoading ? (
                        <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </span>
                    ) : (
                        <span className="flex items-center">
                            {isRegister ? 'Create Account' : 'Sign In'}
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </span>
                    )}
                </button>
              </div>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-50 lg:bg-white text-gray-500">Or</span>
                </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                <Link
                  to={isRegister ? '/login' : '/register'}
                  className="font-semibold text-violet-600 hover:text-violet-500 hover:underline transition-all"
                >
                  {isRegister ? 'Sign in' : 'Register now'}
                </Link>
              </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;