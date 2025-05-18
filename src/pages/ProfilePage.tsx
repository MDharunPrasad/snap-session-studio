
import React, { useState } from 'react';
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
import { Settings, CircleUser, MapPin, Bell } from 'lucide-react';
import Header from '@/components/Header';
import { useIsMobile } from "@/hooks/use-mobile";

const ProfilePage = () => {
  const { currentUser } = usePhotoBoothContext();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Sample locations that can be added to the system
  const [availableLocations, setAvailableLocations] = useState([
    { id: 'entrance', name: 'Entrance', isActive: true },
    { id: 'castle', name: 'Castle', isActive: true },
    { id: 'waterfall', name: 'Waterfall', isActive: true },
    { id: 'themeRide', name: 'Theme Ride', isActive: true },
  ]);
  
  const [newLocation, setNewLocation] = useState('');
  
  const addLocation = () => {
    if (!newLocation.trim()) {
      toast({
        title: "Location Required",
        description: "Please enter a location name.",
        variant: "destructive"
      });
      return;
    }
    
    setAvailableLocations([
      ...availableLocations,
      {
        id: `loc_${Date.now()}`,
        name: newLocation,
        isActive: true
      }
    ]);
    
    setNewLocation('');
    
    toast({
      title: "Location Added",
      description: "The new location has been added successfully."
    });
  };
  
  const toggleLocation = (id) => {
    setAvailableLocations(
      availableLocations.map(loc => 
        loc.id === id ? { ...loc, isActive: !loc.isActive } : loc
      )
    );
  };

  // Sample notification preferences
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    newSessions: true,
    completedEdits: true,
    marketingOffers: false
  });

  const handleNotificationChange = (key) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key]
    });
  };

  // If no user is logged in, redirect to login page
  React.useEffect(() => {
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="flex items-center justify-center">
                <CircleUser className="h-4 w-4 mr-2" />
                <span className={isMobile ? 'hidden' : 'inline'}>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="locations" className="flex items-center justify-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span className={isMobile ? 'hidden' : 'inline'}>Locations</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center justify-center">
                <Bell className="h-4 w-4 mr-2" />
                <span className={isMobile ? 'hidden' : 'inline'}>Notifications</span>
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
                        onClick={addLocation}
                      >
                        Add
                      </Button>
                    </div>
                    
                    <div className="border rounded-md divide-y">
                      {availableLocations.map((location) => (
                        <div key={location.id} className="flex items-center justify-between p-3">
                          <div className="font-medium">{location.name}</div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium ${location.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                              {location.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <Switch 
                              checked={location.isActive} 
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
            
            <TabsContent value="notifications" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-alerts" className="font-medium">Email Alerts</Label>
                      <Switch 
                        id="email-alerts"
                        checked={notifications.emailAlerts}
                        onCheckedChange={() => handleNotificationChange('emailAlerts')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="new-sessions" className="font-medium">New Sessions</Label>
                      <Switch 
                        id="new-sessions"
                        checked={notifications.newSessions}
                        onCheckedChange={() => handleNotificationChange('newSessions')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="completed-edits" className="font-medium">Completed Edits</Label>
                      <Switch 
                        id="completed-edits"
                        checked={notifications.completedEdits}
                        onCheckedChange={() => handleNotificationChange('completedEdits')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="marketing-offers" className="font-medium">Marketing Offers</Label>
                      <Switch 
                        id="marketing-offers"
                        checked={notifications.marketingOffers}
                        onCheckedChange={() => handleNotificationChange('marketingOffers')}
                      />
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
