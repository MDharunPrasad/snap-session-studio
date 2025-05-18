
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { usePhotoBoothContext } from '@/context/PhotoBoothContext';
import { Menu, X, Settings, CircleUser, Package } from 'lucide-react';
import { useIsMobile } from "@/hooks/use-mobile";

const Header = () => {
  const { currentUser, logout } = usePhotoBoothContext();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <header className="bg-gradient-to-r from-photobooth-primary to-photobooth-primary-dark text-white py-3 px-4 md:px-6 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-xl md:text-2xl font-bold flex items-center">
            <Package className="mr-2 h-6 w-6" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">PhotoBooth Studio</span>
          </Link>
        </div>
        
        {isMobile ? (
          <>
            <button 
              onClick={toggleMenu} 
              className="text-white hover:text-blue-200 transition-colors"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            {isMenuOpen && (
              <div className="absolute top-14 right-0 left-0 bg-white shadow-lg z-50 animate-in fade-in slide-in-from-top-5">
                <div className="flex flex-col p-4">
                  {currentUser ? (
                    <>
                      <div className="flex items-center gap-2 p-2 text-photobooth-primary font-semibold">
                        <CircleUser className="h-5 w-5" />
                        <span>{currentUser.name} ({currentUser.role})</span>
                      </div>
                      <Link to="/profile" className="p-2 hover:bg-blue-50 rounded flex items-center gap-2 text-photobooth-primary" onClick={() => setIsMenuOpen(false)}>
                        <Settings className="h-5 w-5" />
                        <span>Profile Settings</span>
                      </Link>
                      <button 
                        className="p-2 mt-2 bg-photobooth-primary text-white rounded hover:bg-photobooth-primary-dark transition-colors text-left"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link 
                      to="/login" 
                      className="p-2 bg-photobooth-primary text-white rounded hover:bg-photobooth-primary-dark transition-colors text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div>
            {currentUser ? (
              <div className="flex items-center gap-4">
                <span className="flex items-center">
                  <CircleUser className="mr-1 h-5 w-5" />
                  {currentUser.name} ({currentUser.role})
                </span>
                <Link to="/profile">
                  <Button 
                    variant="ghost" 
                    className="text-white hover:bg-white/20"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Settings
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="text-white border-white hover:bg-white hover:text-photobooth-primary font-semibold"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button 
                  variant="secondary"
                  className="bg-white text-photobooth-primary hover:bg-gray-100 font-semibold shadow-md px-6 py-2"
                  size="lg"
                >
                  Login
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
