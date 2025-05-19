
import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context
const PhotoBoothContext = createContext(undefined);

export const usePhotoBoothContext = () => {
  const context = useContext(PhotoBoothContext);
  if (context === undefined) {
    throw new Error('usePhotoBoothContext must be used within a PhotoBoothProvider');
  }
  return context;
};

export const PhotoBoothProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [locations, setLocations] = useState([
    { id: 'entrance', name: 'Entrance' },
    { id: 'castle', name: 'Castle' },
    { id: 'waterfall', name: 'Waterfall' },
    { id: 'themeRide', name: 'Theme Ride' }
  ]);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('photoBoothUser');
    const storedSessions = localStorage.getItem('photoBoothSessions');
    const storedLocations = localStorage.getItem('photoBoothLocations');
    
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    
    if (storedSessions) {
      setSessions(JSON.parse(storedSessions));
    } else {
      // Initialize with some sample data if none exists
      const sampleSessions = [
        {
          id: 'session1',
          name: 'John Smith',
          location: 'Castle',
          date: new Date().toISOString(),
          status: 'Active',
          photos: [],
        },
        {
          id: 'session2',
          name: 'Sarah Johnson',
          location: 'Waterfall',
          date: new Date().toISOString(),
          status: 'Completed',
          photos: [],
          bundle: {
            name: '5 Photos Bundle',
            count: 5,
            price: 250
          }
        }
      ];
      
      setSessions(sampleSessions);
      localStorage.setItem('photoBoothSessions', JSON.stringify(sampleSessions));
    }
    
    if (storedLocations) {
      setLocations(JSON.parse(storedLocations));
    } else {
      localStorage.setItem('photoBoothLocations', JSON.stringify(locations));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('photoBoothSessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('photoBoothUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('photoBoothUser');
    }
  }, [currentUser]);
  
  useEffect(() => {
    localStorage.setItem('photoBoothLocations', JSON.stringify(locations));
  }, [locations]);

  // Location management
  const addLocation = (name) => {
    const newLocation = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name: name,
      disabled: false
    };
    
    setLocations(prev => [...prev, newLocation]);
  };

  const updateLocationStatus = (id, disabled) => {
    setLocations(prev => 
      prev.map(loc => 
        loc.id === id ? { ...loc, disabled } : loc
      )
    );
  };

  // User authentication functions
  const login = (email, password, role) => {
    // In a real app, this would validate against server data
    // For this demo, we'll use localStorage
    const users = JSON.parse(localStorage.getItem('photoBoothUsers') || '[]');
    const user = users.find((u) => u.email === email && u.role === role);

    if (user && user.password === password) {
      setCurrentUser({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      });
      return true;
    }

    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const register = (name, email, password, role) => {
    const users = JSON.parse(localStorage.getItem('photoBoothUsers') || '[]');
    
    // Check if user already exists
    if (users.some((u) => u.email === email)) {
      return false;
    }
    
    // Create new user
    const newUser = {
      id: `user_${Date.now()}`,
      name,
      email,
      password, // In a real app, this would be hashed
      role
    };
    
    users.push(newUser);
    localStorage.setItem('photoBoothUsers', JSON.stringify(users));
    
    // Auto login after registration
    setCurrentUser({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    });
    
    return true;
  };

  // Session management functions
  const createSession = (name, location) => {
    const newSession = {
      id: `session_${Date.now()}`,
      name,
      location,
      date: new Date().toISOString(),
      status: 'Active',
      photos: []
    };
    
    setSessions(prevSessions => [...prevSessions, newSession]);
    setCurrentSession(newSession);
    
    return newSession;
  };

  const deleteSession = (id) => {
    setSessions(prevSessions => prevSessions.filter(session => session.id !== id));
    
    if (currentSession?.id === id) {
      setCurrentSession(null);
    }
  };

  const selectBundle = (bundle) => {
    if (currentSession) {
      const updatedSession = { ...currentSession, bundle };
      
      setCurrentSession(updatedSession);
      setSessions(prevSessions => 
        prevSessions.map(session => 
          session.id === currentSession.id ? updatedSession : session
        )
      );
    }
  };

  const addPhoto = (sessionId, photo) => {
    const newPhoto = {
      ...photo,
      id: `photo_${Date.now()}`
    };
    
    setSessions(prevSessions => 
      prevSessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            photos: [...session.photos, newPhoto]
          };
        }
        return session;
      })
    );
    
    if (currentSession?.id === sessionId) {
      setCurrentSession({
        ...currentSession,
        photos: [...currentSession.photos, newPhoto]
      });
    }
  };

  const updatePhoto = (sessionId, photoId, updates) => {
    setSessions(prevSessions => 
      prevSessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            photos: session.photos.map(photo => 
              photo.id === photoId ? { ...photo, ...updates } : photo
            )
          };
        }
        return session;
      })
    );
    
    if (currentSession?.id === sessionId) {
      setCurrentSession({
        ...currentSession,
        photos: currentSession.photos.map(photo => 
          photo.id === photoId ? { ...photo, ...updates } : photo
        )
      });
    }
  };

  const deletePhoto = (sessionId, photoId) => {
    setSessions(prevSessions => 
      prevSessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            photos: session.photos.filter(photo => photo.id !== photoId)
          };
        }
        return session;
      })
    );
    
    if (currentSession?.id === sessionId) {
      setCurrentSession({
        ...currentSession,
        photos: currentSession.photos.filter(photo => photo.id !== photoId)
      });
    }
  };

  const completeSession = (sessionId) => {
    setSessions(prevSessions => 
      prevSessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            status: 'Completed'
          };
        }
        return session;
      })
    );
    
    if (currentSession?.id === sessionId) {
      setCurrentSession({
        ...currentSession,
        status: 'Completed'
      });
    }
  };

  const value = {
    currentUser,
    sessions,
    currentSession,
    locations,
    login,
    logout,
    register,
    createSession,
    deleteSession,
    setCurrentSession,
    selectBundle,
    addPhoto,
    updatePhoto,
    deletePhoto,
    completeSession,
    addLocation,
    updateLocationStatus
  };

  return <PhotoBoothContext.Provider value={value}>{children}</PhotoBoothContext.Provider>;
};
