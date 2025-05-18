
import React, { createContext, useContext, useState, useEffect } from 'react';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Cameraman';
}

interface Photo {
  id: string;
  url: string;
  edited: boolean;
  editedUrl?: string;
}

interface Session {
  id: string;
  name: string;
  location: string;
  date: string;
  status: 'Active' | 'Completed';
  photos: Photo[];
  bundle?: {
    name: string;
    count: number;
    price: number;
  };
}

interface PhotoBoothContextType {
  currentUser: User | null;
  sessions: Session[];
  currentSession: Session | null;
  login: (email: string, password: string, role: string) => boolean;
  logout: () => void;
  register: (name: string, email: string, password: string, role: string) => boolean;
  createSession: (name: string, location: string) => Session;
  deleteSession: (id: string) => void;
  setCurrentSession: (session: Session | null) => void;
  selectBundle: (bundle: { name: string; count: number; price: number }) => void;
  addPhoto: (sessionId: string, photo: Omit<Photo, 'id'>) => void;
  updatePhoto: (sessionId: string, photoId: string, updates: Partial<Photo>) => void;
  completeSession: (sessionId: string) => void;
}

const PhotoBoothContext = createContext<PhotoBoothContextType | undefined>(undefined);

export const usePhotoBoothContext = () => {
  const context = useContext(PhotoBoothContext);
  if (context === undefined) {
    throw new Error('usePhotoBoothContext must be used within a PhotoBoothProvider');
  }
  return context;
};

export const PhotoBoothProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('photoBoothUser');
    const storedSessions = localStorage.getItem('photoBoothSessions');
    
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    
    if (storedSessions) {
      setSessions(JSON.parse(storedSessions));
    } else {
      // Initialize with some sample data if none exists
      const sampleSessions: Session[] = [
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

  // User authentication functions
  const login = (email: string, password: string, role: string): boolean => {
    // In a real app, this would validate against server data
    // For this demo, we'll use localStorage
    const users = JSON.parse(localStorage.getItem('photoBoothUsers') || '[]');
    const user = users.find((u: any) => u.email === email && u.role === role);

    if (user && user.password === password) {
      setCurrentUser({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as 'Admin' | 'Cameraman'
      });
      return true;
    }

    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const register = (name: string, email: string, password: string, role: string): boolean => {
    const users = JSON.parse(localStorage.getItem('photoBoothUsers') || '[]');
    
    // Check if user already exists
    if (users.some((u: any) => u.email === email)) {
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
      role: newUser.role as 'Admin' | 'Cameraman'
    });
    
    return true;
  };

  // Session management functions
  const createSession = (name: string, location: string): Session => {
    const newSession: Session = {
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

  const deleteSession = (id: string) => {
    setSessions(prevSessions => prevSessions.filter(session => session.id !== id));
    
    if (currentSession?.id === id) {
      setCurrentSession(null);
    }
  };

  const selectBundle = (bundle: { name: string; count: number; price: number }) => {
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

  const addPhoto = (sessionId: string, photo: Omit<Photo, 'id'>) => {
    const newPhoto: Photo = {
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

  const updatePhoto = (sessionId: string, photoId: string, updates: Partial<Photo>) => {
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

  const completeSession = (sessionId: string) => {
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
    login,
    logout,
    register,
    createSession,
    deleteSession,
    setCurrentSession,
    selectBundle,
    addPhoto,
    updatePhoto,
    completeSession
  };

  return <PhotoBoothContext.Provider value={value}>{children}</PhotoBoothContext.Provider>;
};
