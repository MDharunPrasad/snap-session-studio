
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePhotoBoothContext } from '@/context/PhotoBoothContext';
import { ArrowRight, Package, Star, Zap } from 'lucide-react';
import Header from '@/components/Header';

const BundlesPage = () => {
  const { setCurrentSession, currentSession } = usePhotoBoothContext();
  const navigate = useNavigate();

  const bundles = [
    {
      id: 1,
      name: "Basic Package",
      price: "$29.99",
      photos: 5,
      editing: "Basic",
      features: ["5 Professional Photos", "Basic Editing", "Digital Download"],
      icon: Package,
      popular: false
    },
    {
      id: 2,
      name: "Premium Package",
      price: "$49.99",
      photos: 10,
      editing: "Advanced",
      features: ["10 Professional Photos", "Advanced Editing", "Digital Download", "Print Ready"],
      icon: Star,
      popular: true
    },
    {
      id: 3,
      name: "Deluxe Package",
      price: "$79.99",
      photos: 20,
      editing: "Professional",
      features: ["20 Professional Photos", "Professional Editing", "Digital Download", "Print Ready", "Custom Frames"],
      icon: Zap,
      popular: false
    }
  ];

  const handleSelectBundle = (bundle) => {
    if (currentSession) {
      setCurrentSession({ ...currentSession, bundle });
      navigate('/editor');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-photobooth-primary mb-4">
            Choose Your Photo Package
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect package for your photo session and start creating amazing memories
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {bundles.map((bundle) => {
            const IconComponent = bundle.icon;
            return (
              <Card 
                key={bundle.id} 
                className={`relative shadow-lg hover:shadow-xl transition-all transform hover:scale-105 ${
                  bundle.popular ? 'ring-2 ring-photobooth-primary border-photobooth-primary' : ''
                }`}
              >
                {bundle.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-photobooth-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-photobooth-primary/10 rounded-full w-fit">
                    <IconComponent className="h-8 w-8 text-photobooth-primary" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-photobooth-primary">
                    {bundle.name}
                  </CardTitle>
                  <div className="text-3xl font-bold text-gray-900 mt-2">
                    {bundle.price}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {bundle.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-600">
                        <div className="w-2 h-2 bg-photobooth-primary rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    onClick={() => handleSelectBundle(bundle)}
                    className={`w-full mt-6 ${
                      bundle.popular 
                        ? 'bg-photobooth-primary hover:bg-photobooth-primary-dark' 
                        : 'bg-gray-600 hover:bg-gray-700'
                    } text-white font-semibold py-3`}
                  >
                    Select Package <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default BundlesPage;
