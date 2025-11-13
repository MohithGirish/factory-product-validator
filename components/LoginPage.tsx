import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoginIcon } from './icons/LoginIcon';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      setError('');
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="relative flex flex-col m-6 space-y-8 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0 w-full max-w-4xl">
        {/* Left Side */}
        <div className="relative w-full md:w-1/2">
          <img
            src="https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=2512&auto=format&fit=crop"
            alt="Factory background"
            className="w-full h-full object-cover rounded-2xl md:rounded-l-2xl md:rounded-r-none"
          />
           <div className="absolute inset-0 bg-blue-900 bg-opacity-50 rounded-2xl md:rounded-l-2xl md:rounded-r-none flex flex-col justify-center p-8 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h1 className="text-4xl font-bold mt-4">Product Validator</h1>
                <p className="mt-2 text-blue-100">Ensuring quality and accuracy for every product that leaves the factory floor.</p>
           </div>
        </div>

        {/* Right Side */}
        <div className="w-full md:w-1/2 p-8 sm:p-12">
            <h2 className="text-3xl font-bold text-gray-800">Member Login</h2>
            <p className="mt-2 text-gray-500">Welcome back! Please sign in to your account.</p>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Username</label>
                    <input
                      className="w-full text-base px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      type="text"
                      placeholder="e.g., admin / qcmanager"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoFocus
                    />
                </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                    <input
                      className="w-full content-center text-base px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                 </div>
            </div>

            {error && <p className="text-sm text-red-500 text-center pt-2">{error}</p>}

            <div className="pt-2">
              <button type="submit" className="w-full flex justify-center items-center bg-blue-600 text-white p-3 rounded-lg tracking-wide font-semibold shadow-lg cursor-pointer transition ease-in duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <LoginIcon />
                <span className="ml-2">Sign In</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
