
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { usePhotoBoothContext } from '@/context/PhotoBoothContext';
import { ArrowRight, Trash, Search, Camera, MapPin, Palette, Monitor } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      
      {/* Hero Section */}
      <div className="w-full bg-photobooth-primary py-16">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Capture Your Perfect Moments
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              Create stunning photo collections with our professional editing tools
            </p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* New Session Card */}
          <Card className="shadow-xl border-2 border-photobooth-primary/20 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-photobooth-primary/10 py-8">
              <CardTitle className="text-2xl font-bold text-photobooth-primary flex items-center justify-center">
                <Camera className="mr-3 h-6 w-6" />
                Start New Photo Session
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 bg-white">
              <form onSubmit={handleStartSession} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-gray-700 font-semibold text-base">
                    Customer Name
                  </Label>
                  <Input 
                    id="name" 
                    placeholder="Enter customer name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border-gray-300 focus:ring-photobooth-primary focus:border-photobooth-primary h-12 text-base"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="location" className="text-gray-700 font-semibold text-base">
                    Location in Park
                  </Label>
                  <Select onValueChange={setLocation}>
                    <SelectTrigger id="location" className="border-gray-300 h-12 text-base">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeLocations.map(loc => (
                        <SelectItem key={loc.id} value={loc.name} className="text-base py-3">
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-photobooth-primary hover:bg-photobooth-primary-dark font-bold text-lg py-4 shadow-lg transition-all transform hover:scale-105"
                >
                  Start Session <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Previous Sessions Card */}
          <Card className="shadow-xl border-2 border-blue-400/20 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-400/10 py-8">
              <CardTitle className="text-2xl font-bold text-blue-600 flex items-center justify-center">
                <MapPin className="mr-3 h-6 w-6" />
                Previous Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 bg-white">
              <div className="space-y-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input 
                    placeholder="Search by name, session ID or location"
                    className="pl-12 border-gray-300 h-12 text-base"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden max-h-[400px] overflow-auto shadow-sm">
                  {filteredSessions.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-lg font-medium mb-2">
                        {searchTerm ? "No matching sessions found" : "No sessions found"}
                      </div>
                      <p className="text-sm text-gray-400">
                        {searchTerm ? "Try adjusting your search terms" : "Create your first session to get started"}
                      </p>
                    </div>
                  ) : (
                    filteredSessions.map(session => (
                      <div 
                        key={session.id}
                        className="p-4 hover:bg-blue-50 cursor-pointer flex items-center justify-between border-b border-gray-100 last:border-b-0 transition-colors"
                        onClick={() => handleOpenSession(session.id)}
                      >
                        <div className="space-y-2 flex-1">
                          <div className="font-semibold text-photobooth-primary text-lg">
                            {session.name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                              {session.id.substring(0, 8)}
                            </span>
                            <span>•</span>
                            <span className="capitalize font-medium">
                              {session.location}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div>{getStatusBadge(session.status)}</div>
                          <button
                            onClick={(e) => handleDeleteSession(session.id, e)}
                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                            aria-label="Delete session"
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          <Card className="bg-gradient-to-br from-photobooth-primary/5 to-photobooth-primary/10 shadow-lg border border-photobooth-primary/20 hover:shadow-xl transition-all transform hover:scale-105">
            <CardContent className="pt-10 pb-10 px-8 text-center">
              <div className="rounded-full bg-photobooth-primary/15 p-5 inline-flex mb-8">
                <Camera className="h-10 w-10 text-photobooth-primary" />
              </div>
              <h3 className="text-2xl font-bold text-photobooth-primary mb-6">
                Professional Photos
              </h3>
              <p className="text-gray-600 text-base leading-relaxed">
                Capture high-quality professional photos with our state-of-the-art equipment and advanced lighting systems
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-400/5 to-blue-400/10 shadow-lg border border-blue-400/20 hover:shadow-xl transition-all transform hover:scale-105">
            <CardContent className="pt-10 pb-10 px-8 text-center">
              <div className="rounded-full bg-blue-400/15 p-5 inline-flex mb-8">
                <Palette className="h-10 w-10 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-blue-600 mb-6">
                Instant Editing
              </h3>
              <p className="text-gray-600 text-base leading-relaxed">
                Edit your photos instantly with our powerful yet easy-to-use editing tools and real-time preview features
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-400/5 to-purple-400/10 shadow-lg border border-purple-400/20 hover:shadow-xl transition-all transform hover:scale-105">
            <CardContent className="pt-10 pb-10 px-8 text-center">
              <div className="rounded-full bg-purple-400/15 p-5 inline-flex mb-8">
                <Monitor className="h-10 w-10 text-purple-500" />
              </div>
              <h3 className="text-2xl font-bold text-purple-600 mb-6">
                Multiple Devices
              </h3>
              <p className="text-gray-600 text-base leading-relaxed">
                Access your photos from any device - mobile, tablet, or desktop with our fully responsive design platform
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
