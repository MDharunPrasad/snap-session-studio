
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { usePhotoBoothContext } from '@/context/PhotoBoothContext';
import { ShoppingCart, CreditCard, FileText, Edit3 } from 'lucide-react';
import Header from '@/components/Header';

const CartPage = () => {
  const { currentSession } = usePhotoBoothContext();
  const navigate = useNavigate();
  const [showInvoiceEditor, setShowInvoiceEditor] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    customerName: currentSession?.name || '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    invoiceNumber: `INV-${Date.now()}`,
    date: new Date().toLocaleDateString(),
    notes: ''
  });

  const subtotal = currentSession?.bundle ? parseFloat(currentSession.bundle.price.replace('$', '')) : 0;
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleInvoiceChange = (field, value) => {
    setInvoiceData(prev => ({ ...prev, [field]: value }));
  };

  const generateInvoice = () => {
    console.log('Generating invoice with data:', invoiceData);
    // Here you would typically generate and download the invoice
    alert('Invoice generated successfully!');
  };

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-600">No active session</h1>
          <Button onClick={() => navigate('/')} className="mt-4">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-photobooth-primary mb-4 flex items-center justify-center">
              <ShoppingCart className="mr-3 h-8 w-8" />
              Your Cart
            </h1>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cart Items */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-photobooth-primary">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Session: {currentSession.name}</span>
                  <span className="text-sm text-gray-500">{currentSession.id.substring(0, 8)}</span>
                </div>
                
                {currentSession.bundle && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">{currentSession.bundle.name}</span>
                      <span className="font-bold text-photobooth-primary">{currentSession.bundle.price}</span>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {currentSession.bundle.features.map((feature, index) => (
                        <li key={index}>• {feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (10%):</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-photobooth-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Invoice & Payment */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-photobooth-primary flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Invoice & Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowInvoiceEditor(!showInvoiceEditor)}
                    className="flex-1"
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    {showInvoiceEditor ? 'Hide' : 'Edit'} Invoice
                  </Button>
                  <Button
                    onClick={generateInvoice}
                    className="flex-1 bg-photobooth-primary hover:bg-photobooth-primary-dark"
                  >
                    Generate Invoice
                  </Button>
                </div>
                
                {showInvoiceEditor && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="customerName">Customer Name</Label>
                        <Input
                          id="customerName"
                          value={invoiceData.customerName}
                          onChange={(e) => handleInvoiceChange('customerName', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="customerEmail">Email</Label>
                        <Input
                          id="customerEmail"
                          type="email"
                          value={invoiceData.customerEmail}
                          onChange={(e) => handleInvoiceChange('customerEmail', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="customerPhone">Phone</Label>
                        <Input
                          id="customerPhone"
                          value={invoiceData.customerPhone}
                          onChange={(e) => handleInvoiceChange('customerPhone', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="invoiceNumber">Invoice #</Label>
                        <Input
                          id="invoiceNumber"
                          value={invoiceData.invoiceNumber}
                          onChange={(e) => handleInvoiceChange('invoiceNumber', e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="customerAddress">Address</Label>
                      <Input
                        id="customerAddress"
                        value={invoiceData.customerAddress}
                        onChange={(e) => handleInvoiceChange('customerAddress', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Input
                        id="notes"
                        value={invoiceData.notes}
                        onChange={(e) => handleInvoiceChange('notes', e.target.value)}
                        placeholder="Additional notes or comments"
                      />
                    </div>
                  </div>
                )}
                
                <Separator />
                
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Proceed to Payment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CartPage;
