
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePhotoBoothContext } from '@/context/PhotoBoothContext';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';

const BundlesPage = () => {
  const navigate = useNavigate();
  const { currentSession, setCurrentSession } = usePhotoBoothContext();

  const bundles = [
    {
      id: 'basic',
      name: 'Basic Package',
      price: '$29',
      photos: 5,
      description: 'Perfect for quick memories'
    },
    {
      id: 'standard',
      name: 'Standard Package',
      price: '$49',
      photos: 10,
      description: 'Great value for families'
    },
    {
      id: 'premium',
      name: 'Premium Package',
      price: '$79',
      photos: 20,
      description: 'Complete photo experience'
    }
  ];

  const handleSelectBundle = (bundle) => {
    if (currentSession) {
      setCurrentSession({
        ...currentSession,
        bundle: bundle
      });
      navigate('/editor');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          onClick={() => navigate('/')} 
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-photobooth-primary mb-4">
            Choose Your Photo Package
          </h1>
          {currentSession && (
            <p className="text-gray-600">
              Session for: <span className="font-semibold">{currentSession.name}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {bundles.map((bundle) => (
            <Card key={bundle.id} className="relative hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{bundle.name}</CardTitle>
                <div className="text-3xl font-bold text-photobooth-primary">{bundle.price}</div>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="text-2xl font-semibold">{bundle.photos} Photos</div>
                <p className="text-gray-600">{bundle.description}</p>
                <Button 
                  onClick={() => handleSelectBundle(bundle)}
                  className="w-full bg-photobooth-primary hover:bg-photobooth-primary-dark"
                >
                  Select Package
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default BundlesPage;
