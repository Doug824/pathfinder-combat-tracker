import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import logoIcon from '../../assets/HerosLedgerLogo.png';

const PWAInstallPrompt = ({ className = "" }) => {
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await promptInstall();
      if (success) {
        console.log('App installation initiated');
      }
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  // Don't show anything if not installable or already installed
  if (!isInstallable || isInstalled) {
    return null;
  }

  return (
    <div className={`pwa-install-prompt ${className}`}>
      <div className="bg-gradient-to-r from-amber-900/20 to-amber-800/20 border border-amber-700/40 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <img 
            src={logoIcon} 
            alt="Hero's Ledger" 
            className="w-8 h-8 rounded-full border border-amber-600/50"
          />
          <div className="flex-1">
            <h3 className="text-amber-300 font-fantasy font-semibold text-sm">
              📱 Get the App
            </h3>
            <p className="text-amber-200/70 text-xs">
              Install Hero's Ledger for the best experience
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className="flex-1 bg-amber-800/40 hover:bg-amber-700/50 border border-amber-600/50 text-amber-200 px-3 py-2 rounded-md text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isInstalling ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 border border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                Installing...
              </span>
            ) : (
              '⬇️ Install App'
            )}
          </button>
        </div>
        
        <div className="mt-2 text-xs text-amber-200/50">
          ✨ Offline access • 🚀 Faster loading • 📲 App-like experience
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;