
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { usePhotoBoothContext } from '@/context/PhotoBoothContext';
import { Settings, CircleUser, MapPin } from 'lucide-react';
import Header from '@/components/Header';
import { useIsMobile } from "@/hooks/use-mobile";

const ProfilePage = () => {
  const { currentUser, locations, addLocation, updateLocationStatus } = usePhotoBoothContext();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [newLocation, setNewLocation] = useState('');
  const [availableLocations, setAvailableLocations] = useState([]);

  // Initialize locations from context
  useEffect(() => {
    if (locations && locations.length > 0) {
      setAvailableLocations(locations);
    }
  }, [locations]);
  
  const handleAddLocation = () => {
    if (!newLocation.trim()) {
      toast({
        title: "Location Required",
        description: "Please enter a location name.",
        variant: "destructive"
      });
      return;
    }
    
    if (addLocation) {
      addLocation(newLocation);
      setNewLocation('');
      
      toast({
        title: "Location Added",
        description: "The new location has been added successfully."
      });
    }
  };
  
  const toggleLocation = (id) => {
    const location = availableLocations.find(loc => loc.id === id);
    if (location && updateLocationStatus) {
      updateLocationStatus(id, !location.disabled);
    }
  };

  // If no user is logged in, redirect to login page
  useEffect(() => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access your profile settings.",
        variant: "destructive"
      });
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <div className="h-16 w-16 rounded-full bg-photobooth-primary flex items-center justify-center text-white text-xl font-bold mr-4">
              {currentUser.name.substring(0, 1)}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{currentUser.name}</h1>
              <p className="text-gray-600">{currentUser.role}</p>
            </div>
          </div>
          
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile" className="flex items-center justify-center">
                <CircleUser className="h-4 w-4 mr-2" />
                <span className={isMobile ? 'hidden' : 'inline'}>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="locations" className="flex items-center justify-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span className={isMobile ? 'hidden' : 'inline'}>Locations</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CircleUser className="h-5 w-5 mr-2" />
                    Profile Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" defaultValue={currentUser.name} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue={currentUser.email} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select defaultValue={currentUser.role}>
                        <SelectTrigger id="role">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Cameraman">Cameraman</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button className="bg-photobooth-primary hover:bg-photobooth-primary-dark">
                      Save Changes
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="locations" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Available Locations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-end gap-2">
                      <div className="flex-grow space-y-2">
                        <Label htmlFor="new-location">Add New Location</Label>
                        <Input 
                          id="new-location" 
                          value={newLocation}
                          onChange={(e) => setNewLocation(e.target.value)}
                          placeholder="Enter location name"
                        />
                      </div>
                      <Button 
                        className="bg-photobooth-primary hover:bg-photobooth-primary-dark"
                        onClick={handleAddLocation}
                      >
                        Add
                      </Button>
                    </div>
                    
                    <div className="border rounded-md divide-y">
                      {availableLocations.map((location) => (
                        <div key={location.id} className="flex items-center justify-between p-3">
                          <div className="font-medium">{location.name}</div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium ${!location.disabled ? 'text-green-600' : 'text-gray-500'}`}>
                              {!location.disabled ? 'Active' : 'Inactive'}
                            </span>
                            <Switch 
                              checked={!location.disabled} 
                              onCheckedChange={() => toggleLocation(location.id)} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
