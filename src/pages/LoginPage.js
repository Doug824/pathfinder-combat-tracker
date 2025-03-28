import React, { useState } from 'react';

const LoginPage = ({ onLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setMessage({ 
        type: 'error',
        text: 'Username and password are required'
      });
      return;
    }
    
    if (isLogin) {
      const result = onLogin(username, password);
      setMessage({
        type: result.success ? 'success' : 'error',
        text: result.message
      });
    } else {
      const result = onRegister(username, password);
      setMessage({
        type: result.success ? 'success' : 'error',
        text: result.message
      });
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-header">
        <h1>BuffStacker</h1>
        <p className="login-tagline">The only app that can handle your Pathfinder nonsense.</p>
      </div>
      
      <div className="login-card">
        <h2>{isLogin ? 'Login' : 'Create Account'}</h2>
        
        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isLogin ? "current-password" : "new-password"}
              className="form-control"
            />
          </div>
          
          <button type="submit" className="login-button">
            {isLogin ? 'Login' : 'Create Account'}
          </button>
          
          <div className="form-toggle">
            {isLogin ? (
              <p>
                Need an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="toggle-button"
                >
                  Register
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="toggle-button"
                >
                  Login
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;