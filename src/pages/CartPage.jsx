
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePhotoBoothContext } from '@/context/PhotoBoothContext';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import Header from '@/components/Header';

const CartPage = () => {
  const navigate = useNavigate();
  const { currentSession } = usePhotoBoothContext();

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
          <h1 className="text-3xl font-bold text-photobooth-primary mb-4 flex items-center justify-center">
            <ShoppingCart className="mr-3 h-8 w-8" />
            Your Cart
          </h1>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {currentSession && currentSession.bundle ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">{currentSession.bundle.name}</span>
                  <span className="font-bold">{currentSession.bundle.price}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {currentSession.bundle.photos} photos included
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span>{currentSession.bundle.price}</span>
                  </div>
                </div>
                <Button className="w-full bg-photobooth-primary hover:bg-photobooth-primary-dark">
                  Proceed to Checkout
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Your cart is empty</p>
                <Button onClick={() => navigate('/bundles')}>
                  Browse Packages
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CartPage;
