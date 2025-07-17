import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';
import HeroLandingPage from '../Landing/HeroLandingPage';
import './Auth.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showLanding, setShowLanding] = useState(true);

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  const handleGetStarted = () => {
    setShowLanding(false);
  };

  const handleBackToLanding = () => {
    setShowLanding(true);
  };

  if (showLanding) {
    return <HeroLandingPage onGetStarted={handleGetStarted} />;
  }

  return (
    <div className="auth-container">
      <div className="auth-back-to-landing">
        <button 
          onClick={handleBackToLanding}
          className="back-to-landing-btn"
        >
          ← Back to Home
        </button>
      </div>
      
      {isLogin ? (
        <LoginForm onToggleMode={toggleMode} />
      ) : (
        <SignUpForm onToggleMode={toggleMode} />
      )}
    </div>
  );
};

export default AuthPage;