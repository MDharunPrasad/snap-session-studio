
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { usePhotoBoothContext } from '@/context/PhotoBoothContext';
import { Trash2, ShoppingCart, ArrowLeft, CheckCircle, Package } from 'lucide-react';
import Header from '@/components/Header';

const CartPage: React.FC = () => {
  const { currentSession, completeSession } = usePhotoBoothContext();
  const [total, setTotal] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If no active session, redirect to home
    if (!currentSession || !currentSession.bundle) {
      toast({
        title: "Missing Session or Bundle",
        description: "Please start a new session and select a bundle first.",
        variant: "destructive"
      });
      navigate('/');
      return;
    }
    
    // Calculate total cost
    let calculatedTotal = 0;
    
    if (currentSession.bundle) {
      // Convert string to number if needed
      const price = typeof currentSession.bundle.price === 'string' 
        ? parseFloat(currentSession.bundle.price) 
        : currentSession.bundle.price;
        
      calculatedTotal += price;
    }
    
    // Add any additional options or fees here if needed
    
    setTotal(calculatedTotal);
  }, [currentSession, navigate, toast]);
  
  const handleCompletePurchase = () => {
    if (currentSession && currentSession.photos.length > 0) {
      completeSession(currentSession.id);
      
      toast({
        title: "Purchase Complete!",
        description: "Thank you for your purchase. Your photos are ready to download.",
        variant: "default",
      });
      
      navigate('/');
    } else {
      toast({
        title: "Cannot Complete Purchase",
        description: "Please upload at least one photo before completing your purchase.",
        variant: "destructive"
      });
    }
  };
  
  if (!currentSession || !currentSession.bundle) return null;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-photobooth-primary flex items-center mb-6">
            <ShoppingCart className="mr-2 h-6 w-6" />
            Your Cart
          </h1>
          
          <div className="grid gap-6">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 border-b bg-blue-50">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg flex items-center">
                      <Package className="mr-2 h-4 w-4" />
                      {currentSession.bundle.name}
                    </h3>
                    <div className="font-semibold">₹{currentSession.bundle.price}</div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{currentSession.bundle.description}</p>
                </div>
                
                <div className="divide-y">
                  {currentSession.photos.length > 0 ? (
                    <div className="p-4">
                      <h4 className="font-medium mb-3">Photos ({currentSession.photos.length})</h4>
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                        {currentSession.photos.map((photo) => (
                          <div key={photo.id} className="aspect-[4/3] bg-gray-100 rounded overflow-hidden">
                            <img 
                              src={photo.url} 
                              alt="Session photo" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No photos uploaded yet. Return to the editor to add photos.
                    </div>
                  )}
                  
                  <div className="p-4">
                    <h4 className="font-medium mb-3">Customer Information</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="text-gray-500">Name:</div>
                      <div>{currentSession.name}</div>
                      <div className="text-gray-500">Location:</div>
                      <div className="capitalize">{currentSession.location}</div>
                      <div className="text-gray-500">Date:</div>
                      <div>{new Date(currentSession.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>₹{(total * 0.18).toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t mt-2">
                    <div className="flex justify-between font-semibold text-base">
                      <span>Total</span>
                      <span>₹{(total + total * 0.18).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex flex-col sm:flex-row justify-between gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/editor')}
                className="flex items-center justify-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Editor
              </Button>
              
              <Button 
                onClick={handleCompletePurchase}
                className="bg-photobooth-primary hover:bg-photobooth-primary-dark flex items-center justify-center"
                disabled={currentSession.photos.length === 0}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Complete Purchase
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
