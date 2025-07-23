import React, { useState } from 'react';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import logoIcon from '../../assets/HerosLedgerLogo.png';
import './Auth.css';

const LoginForm = ({ onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signInWithGoogle } = useFirebaseAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(email, password);
    } catch (error) {
      setError('Failed to sign in: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
    } catch (error) {
      setError('Failed to sign in with Google: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black/60 backdrop-blur-md rounded-lg border-2 border-amber-700/50 p-8 max-w-md mx-auto">
      {/* Fantasy Auth Header */}
      <div className="text-center mb-8">
        <img 
          src={logoIcon} 
          alt="Hero's Ledger Logo" 
          className="w-20 h-20 mx-auto mb-4 rounded-full border-2 border-ornate-gold shadow-fantasy-glow"
        />
        <h2 className="text-3xl font-fantasy font-bold text-ornate-gold mb-2">Welcome Back, Hero</h2>
        <p className="text-amber-200/70">Sign in to continue your legendary adventures</p>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-600/50 text-red-200 p-3 rounded-lg mb-6 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-amber-300 font-fantasy font-semibold">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            className="input-fantasy w-full"
            placeholder="Enter your email"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-amber-300 font-fantasy font-semibold">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            className="input-fantasy w-full"
            placeholder="Enter your password"
          />
        </div>

        <button 
          type="submit" 
          className="btn-primary w-full py-3 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? '⚔️ Entering...' : '⚔️ Enter the Realm'}
        </button>
      </form>

      <div className="my-6 flex items-center">
        <div className="flex-1 h-px bg-amber-700/30"></div>
        <span className="px-4 text-amber-200/70 text-sm">or</span>
        <div className="flex-1 h-px bg-amber-700/30"></div>
      </div>

      <button 
        onClick={handleGoogleSignIn}
        className="w-full py-3 bg-white/90 hover:bg-white text-gray-800 font-semibold rounded-lg border-2 border-amber-700/30 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
        disabled={loading}
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
          <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.53H1.83v2.07A8 8 0 0 0 8.98 17z"/>
          <path fill="#FBBC05" d="M4.5 10.49a4.8 4.8 0 0 1 0-3.07V5.35H1.83a8 8 0 0 0 0 7.28l2.67-2.14z"/>
          <path fill="#EA4335" d="M8.98 3.54c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.35L4.5 7.42a4.77 4.77 0 0 1 4.48-3.88z"/>
        </svg>
        Continue with Google
      </button>

      <div className="text-center mt-6 pt-6 border-t border-amber-700/30">
        <p className="text-amber-200/70">
          Don't have an account?{' '}
          <button 
            onClick={onToggleMode}
            className="text-amber-400 hover:text-amber-300 font-semibold underline transition-colors"
            disabled={loading}
          >
            Create one
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;