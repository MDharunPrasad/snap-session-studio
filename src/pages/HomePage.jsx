
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { usePhotoBoothContext } from '@/context/PhotoBoothContext';
import { ArrowRight, Trash, Search, Camera, MapPin } from 'lucide-react';
import Header from '@/components/Header';

const HomePage = () => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { createSession, sessions, deleteSession, setCurrentSession, locations } = usePhotoBoothContext();
  const navigate = useNavigate();

  const handleStartSession = (e) => {
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

  const handleOpenSession = (sessionId) => {
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

  const handleDeleteSession = (sessionId, e) => {
    e.stopPropagation();
    deleteSession(sessionId);
    toast({
      title: "Session Deleted",
      description: "The photo session has been deleted."
    });
  };

  const getStatusBadge = (status) => {
    if (status === 'Active') {
      return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Active</span>;
    }
    return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">Completed</span>;
  };

  const filteredSessions = searchTerm
    ? sessions.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : sessions;

  // Get active locations from context
  const activeLocations = locations ? locations.filter(loc => !loc.disabled) : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <Header />
      
      <div className="w-full bg-photobooth-primary py-10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Capture Your Perfect Moments
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-6">
              Create stunning photo collections with our professional editing tools
            </p>
          </div>
        </div>
      </div>
      
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* New Session Card */}
          <Card className="shadow-lg border-2 border-photobooth-primary/20 rounded-xl overflow-hidden">
            <CardHeader className="bg-blue-50 border-b border-photobooth-primary/10 py-4">
              <CardTitle className="text-xl font-bold text-photobooth-primary flex items-center">
                <Camera className="mr-2 h-5 w-5" />
                Start New Photo Session
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white">
              <form onSubmit={handleStartSession} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700 font-medium">Customer Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Enter customer name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border-gray-300 focus:ring-photobooth-primary focus:border-photobooth-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-gray-700 font-medium">Location in Park</Label>
                  <Select onValueChange={setLocation}>
                    <SelectTrigger id="location" className="border-gray-300">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeLocations.map(loc => (
                        <SelectItem key={loc.id} value={loc.name}>{loc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-photobooth-primary hover:bg-photobooth-primary-dark font-bold shadow-md transition-all"
                >
                  Start Session <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Previous Sessions Card */}
          <Card className="shadow-lg border-2 border-blue-400/20 rounded-xl overflow-hidden">
            <CardHeader className="bg-blue-50 border-b border-blue-400/10 py-4">
              <CardTitle className="text-xl font-bold text-blue-600 flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Previous Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search by name, tag or location"
                    className="pl-9 border-gray-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {filteredSessions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm ? "No matching sessions found" : "No sessions found"}
                  </div>
                ) : (
                  <div className="bg-white rounded-md border border-gray-200 overflow-hidden max-h-[350px] overflow-auto shadow-sm">
                    {filteredSessions.map(session => (
                      <div 
                        key={session.id}
                        className="p-3 hover:bg-blue-50 cursor-pointer flex items-center justify-between border-b border-gray-100 last:border-b-0 transition-colors"
                        onClick={() => handleOpenSession(session.id)}
                      >
                        <div className="space-y-1">
                          <div className="font-medium text-photobooth-primary">{session.name}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <span className="font-mono">{session.id.substring(0, 8)}</span>
                            <span>•</span>
                            <span className="capitalize">{session.location}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div>{getStatusBadge(session.status)}</div>
                          <button
                            onClick={(e) => handleDeleteSession(session.id, e)}
                            className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-full transition-colors"
                            aria-label="Delete session"
                          >
                            <Trash size={16} />
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
        
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-b from-photobooth-primary/5 to-transparent shadow-sm border border-photobooth-primary/10 hover:shadow-md transition-all">
            <CardContent className="pt-6 pb-5 text-center">
              <div className="rounded-full bg-photobooth-primary/10 p-3 inline-flex mb-4">
                <Camera className="h-6 w-6 text-photobooth-primary" />
              </div>
              <h3 className="text-lg font-bold text-photobooth-primary mb-2">Professional Photos</h3>
              <p className="text-gray-600 text-sm">Capture high-quality professional photos with our state-of-the-art equipment</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-b from-blue-400/5 to-transparent shadow-sm border border-blue-400/10 hover:shadow-md transition-all">
            <CardContent className="pt-6 pb-5 text-center">
              <div className="rounded-full bg-blue-400/10 p-3 inline-flex mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-blue-500">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M3 12h.01M12 3v.01M21 12h-.01M12 21v-.01"></path>
                  <path d="M7.5 4.2a9 9 0 0 0-3.3 3.3M4.2 16.5a9 9 0 0 0 3.3 3.3M16.5 19.8a9 9 0 0 0 3.3-3.3M19.8 7.5a9 9 0 0 0-3.3-3.3"></path>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-blue-600 mb-2">Instant Editing</h3>
              <p className="text-gray-600 text-sm">Edit your photos instantly with our powerful yet easy-to-use editing tools</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-b from-purple-400/5 to-transparent shadow-sm border border-purple-400/10 hover:shadow-md transition-all">
            <CardContent className="pt-6 pb-5 text-center">
              <div className="rounded-full bg-purple-400/10 p-3 inline-flex mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-purple-500">
                  <rect width="20" height="14" x="2" y="3" rx="2"></rect>
                  <line x1="8" x2="16" y1="21" y2="21"></line>
                  <line x1="12" x2="12" y1="17" y2="21"></line>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-purple-600 mb-2">Multiple Devices</h3>
              <p className="text-gray-600 text-sm">Access your photos from any device - mobile, tablet, or desktop with responsive design</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
