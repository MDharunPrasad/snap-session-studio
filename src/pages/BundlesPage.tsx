
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePhotoBoothContext } from '@/context/PhotoBoothContext';
import { useToast } from "@/components/ui/use-toast";
import Header from '@/components/Header';
import { Package, Star, Image, Check } from 'lucide-react';
import { useIsMobile } from "@/hooks/use-mobile";

interface PhotoBundle {
  name: string;
  count: number | 'unlimited';
  price: number;
  description: string;
  isPopular?: boolean;
  features?: string[];
}

const BundlesPage = () => {
  const { currentSession, selectBundle } = usePhotoBoothContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Enhanced bundle options
  const bundles: PhotoBundle[] = [
    {
      name: "Basic Pack",
      count: 2,
      price: 50,
      description: "Simple package for quick memories",
      features: [
        "2 professional photos",
        "Digital copies available",
        "Basic editing included",
      ]
    },
    {
      name: "Standard Pack",
      count: 5,
      price: 250,
      description: "Popular choice with great value",
      isPopular: true,
      features: [
        "5 professional photos",
        "Digital copies included",
        "Enhanced editing options",
        "One location of your choice"
      ]
    },
    {
      name: "Premium Pack",
      count: 10,
      price: 500,
      description: "Great value for more memories",
      features: [
        "10 professional photos",
        "High resolution digital copies",
        "Full editing capabilities",
        "Two locations of your choice"
      ]
    },
    {
      name: "Unlimited Pack",
      count: "unlimited",
      price: 999,
      description: "Ultimate experience with no limits",
      features: [
        "Unlimited photos",
        "4K resolution digital copies",
        "Advanced editing features",
        "Multiple locations",
        "Priority processing"
      ]
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
    
    selectBundle({
      name: bundle.name,
      count: typeof bundle.count === 'number' ? bundle.count : 999,
      price: bundle.price
    });
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
  }, [currentSession, navigate, toast]);

  if (!currentSession) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-photobooth-primary mb-4">
              Select Your Perfect Bundle
            </h1>
            
            <p className="text-gray-600 md:text-lg max-w-2xl mx-auto">
              Choose a bundle that fits your needs. All packages include professional editing 
              and high-quality prints delivered to you.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bundles.map((bundle) => (
              <Card 
                key={bundle.name}
                className={`overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                  bundle.isPopular ? 'border-2 border-photobooth-accent ring-2 ring-blue-200' : ''
                }`}
              >
                {bundle.isPopular && (
                  <div className="bg-photobooth-accent text-white text-center py-1 text-sm font-semibold">
                    <Star className="h-3 w-3 inline-block mr-1" /> Most Popular
                  </div>
                )}
                <CardContent className={`p-6 ${isMobile ? 'text-center' : ''}`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-photobooth-primary mx-auto">
                      {bundle.count === "unlimited" ? (
                        <Star className="h-6 w-6" />
                      ) : (
                        <Package className="h-6 w-6" />
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-photobooth-primary">{bundle.name}</h2>
                    <div className="text-3xl font-bold">₹{bundle.price}</div>
                    <div className="flex items-baseline justify-center gap-1">
                      <Image className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">
                        {bundle.count === "unlimited" ? "Unlimited Photos" : `${bundle.count} Photos`}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{bundle.description}</p>
                    
                    <ul className="space-y-2 mt-4 text-sm text-left">
                      {bundle.features?.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={`w-full mt-4 ${bundle.isPopular ? 'bg-photobooth-accent hover:bg-blue-600' : 'bg-photobooth-primary hover:bg-photobooth-primary-dark'}`}
                      onClick={() => handleSelectBundle(bundle)}
                    >
                      Select Bundle
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
              className="hover:bg-white"
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
