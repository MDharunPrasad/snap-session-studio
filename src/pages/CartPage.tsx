
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { usePhotoBoothContext } from '@/context/PhotoBoothContext';
import Header from '@/components/Header';

const CartPage: React.FC = () => {
  const { currentSession, completeSession } = usePhotoBoothContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  // If no active session, redirect to home
  React.useEffect(() => {
    if (!currentSession || !currentSession.bundle) {
      toast({
        title: "Missing Session or Bundle",
        description: "Please start a new session and select a bundle first.",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [currentSession, navigate]);

  const handlePrint = () => {
    toast({
      title: "Print Job Sent",
      description: "Your photos have been sent to the printer.",
    });
  };

  const handleCompletePurchase = () => {
    if (currentSession) {
      completeSession(currentSession.id);
      
      toast({
        title: "Purchase Completed",
        description: "Thank you for your purchase! Your session is now complete.",
      });
      
      navigate('/');
    }
  };

  if (!currentSession || !currentSession.bundle) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-photobooth-primary">
              Your Cart
            </h1>
            
            <div className="text-sm text-gray-600">
              Session: {currentSession.name} - {currentSession.location}
            </div>
          </div>
          
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Order Summary</h2>
                <span className="text-sm text-gray-500">
                  {currentSession.photos.length} photo(s)
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {currentSession.photos.map((photo, index) => (
                  <div key={index} className="aspect-[4/3] bg-gray-100 rounded overflow-hidden">
                    <img 
                      src={photo.editedUrl || photo.url} 
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                
                {/* Add empty placeholders if bundle size > photos length */}
                {Array(currentSession.bundle.count - currentSession.photos.length).fill(null).map((_, index) => (
                  <div 
                    key={`empty-${index}`}
                    className="aspect-[4/3] bg-gray-100 rounded flex items-center justify-center text-gray-400"
                  >
                    <span className="text-sm">Empty</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between mb-2">
                  <span>Bundle: {currentSession.bundle.name}</span>
                  <span>₹{currentSession.bundle.price}</span>
                </div>
                
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>₹{currentSession.bundle.price}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/editor')}
            >
              Back to Editor
            </Button>
            
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={handlePrint}
              >
                Print Photos
              </Button>
              
              <Button 
                className="bg-photobooth-primary hover:bg-photobooth-primary-dark"
                onClick={handleCompletePurchase}
              >
                Complete Purchase
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CartPage;
