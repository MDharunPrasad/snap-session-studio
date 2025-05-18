
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePhotoBoothContext } from '@/context/PhotoBoothContext';
import { useToast } from "@/components/ui/use-toast";
import Header from '@/components/Header';

interface PhotoBundle {
  name: string;
  count: number;
  price: number;
  description: string;
}

const BundlesPage: React.FC = () => {
  const { currentSession, selectBundle } = usePhotoBoothContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Predefined bundle options
  const bundles: PhotoBundle[] = [
    {
      name: "2 Photos",
      count: 2,
      price: 50,
      description: "Basic package for quick memories"
    },
    {
      name: "5 Photos",
      count: 5,
      price: 250,
      description: "Popular choice with 10% savings"
    },
    {
      name: "10 Photos",
      count: 10,
      price: 500,
      description: "Great value for more memories"
    },
    {
      name: "15 Photos",
      count: 15,
      price: 750,
      description: "Ultimate package with maximum savings"
    }
  ];

  const handleSelectBundle = (bundle: PhotoBundle) => {
    if (!currentSession) {
      toast({
        title: "No Active Session",
        description: "Please start a new session first.",
        variant: "destructive"
      });
      navigate('/');
      return;
    }
    
    selectBundle(bundle);
    navigate('/editor');
  };

  // If no active session, redirect to home
  React.useEffect(() => {
    if (!currentSession) {
      toast({
        title: "No Active Session",
        description: "Please start a new session first.",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [currentSession, navigate]);

  if (!currentSession) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center text-photobooth-primary mb-8">
            Select Number of Prints
          </h1>
          
          <p className="text-center text-gray-600 mb-8">
            How many photos would you like to print? Choose a bundle to see a rough price. 
            You can edit, preview, and confirm your selection before purchase.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bundles.map((bundle) => (
              <Card 
                key={bundle.name}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleSelectBundle(bundle)}
              >
                <CardContent className="p-6">
                  <div className="text-center space-y-3">
                    <h2 className="text-2xl font-bold text-photobooth-primary">{bundle.count}</h2>
                    <p className="font-medium">{bundle.name}</p>
                    <div className="text-xl font-bold">₹{bundle.price}</div>
                    <p className="text-sm text-gray-500">{bundle.description}</p>
                    <Button 
                      className="w-full mt-4 bg-photobooth-primary hover:bg-photobooth-primary-dark"
                    >
                      Select
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BundlesPage;
