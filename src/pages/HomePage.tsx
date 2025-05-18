
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { usePhotoBoothContext } from '@/context/PhotoBoothContext';
import { ArrowRight, Trash } from 'lucide-react';
import Header from '@/components/Header';

const HomePage: React.FC = () => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const { createSession, sessions, deleteSession, setCurrentSession } = usePhotoBoothContext();
  const navigate = useNavigate();

  const handleStartSession = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      toast({
        title: "Name Required",
        description: "Please enter a customer name to start a session.",
        variant: "destructive"
      });
      return;
    }
    
    if (!location) {
      toast({
        title: "Location Required",
        description: "Please select a location for the session.",
        variant: "destructive"
      });
      return;
    }
    
    const newSession = createSession(name, location);
    navigate('/bundles');
  };

  const handleOpenSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
      if (session.bundle) {
        navigate('/editor');
      } else {
        navigate('/bundles');
      }
    }
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSession(sessionId);
    toast({
      title: "Session Deleted",
      description: "The photo session has been deleted."
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Active') {
      return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Active</span>;
    }
    return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">Completed</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* New Session Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-photobooth-primary">Start New Photo Session</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStartSession} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Customer Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Enter customer name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location in Park</Label>
                  <Select onValueChange={setLocation}>
                    <SelectTrigger id="location">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entrance">Entrance</SelectItem>
                      <SelectItem value="castle">Castle</SelectItem>
                      <SelectItem value="waterfall">Waterfall</SelectItem>
                      <SelectItem value="themeRide">Theme Ride</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-photobooth-primary hover:bg-photobooth-primary-dark font-bold"
                >
                  Start Session <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Previous Sessions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-photobooth-primary">Previous Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <Input 
                  placeholder="Search by tag number or name"
                  className="mb-4" 
                />
                
                {sessions.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    No sessions found
                  </div>
                ) : (
                  <div className="session-list max-h-[400px] overflow-auto">
                    {sessions.map(session => (
                      <div 
                        key={session.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                        onClick={() => handleOpenSession(session.id)}
                      >
                        <div className="space-y-1">
                          <div className="font-medium">{session.name}</div>
                          <div className="text-sm text-gray-500">
                            {session.id.substring(0, 8)} • {session.location}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div>{getStatusBadge(session.status)}</div>
                          <button
                            onClick={(e) => handleDeleteSession(session.id, e)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
