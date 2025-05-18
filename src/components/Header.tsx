
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { usePhotoBoothContext } from '@/context/PhotoBoothContext';

const Header: React.FC = () => {
  const { currentUser, logout } = usePhotoBoothContext();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <header className="bg-photobooth-primary text-white py-3 px-4 md:px-6 flex justify-between items-center shadow-md">
      <div>
        <Link to="/" className="text-xl font-bold">PhotoBooth Software</Link>
      </div>
      
      <div>
        {currentUser ? (
          <div className="flex items-center gap-4">
            <span className="hidden md:block">
              {currentUser.name} ({currentUser.role})
            </span>
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
    </header>
  );
};

export default Header;
