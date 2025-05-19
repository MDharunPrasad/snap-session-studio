
import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { usePhotoBoothContext } from '@/context/PhotoBoothContext';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';

const QRScannerPage = () => {
  const [scanResult, setScanResult] = useState(null);
  const navigate = useNavigate();
  const { sessions, setCurrentSession } = usePhotoBoothContext();
  
  useEffect(() => {
    // Create and initialize the QR scanner
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    const success = (decodedText) => {
      scanner.clear();
      setScanResult(decodedText);
      
      // Try to match the scanned QR code to a session ID
      const sessionId = decodedText.trim();
      const matchedSession = sessions.find(s => s.id === sessionId);
      
      if (matchedSession) {
        setCurrentSession(matchedSession);
        
        toast({
          title: "Session Found",
          description: `Opening session for ${matchedSession.name}`,
        });
        
        // Navigate based on whether the session has a bundle selected
        if (matchedSession.bundle) {
          navigate('/editor');
        } else {
          navigate('/bundles');
        }
      } else {
        toast({
          title: "Session Not Found",
          description: "No matching session was found for this QR code.",
          variant: "destructive"
        });
      }
    };
    
    const error = (err) => {
      console.warn(err);
    };
    
    // Start the scanner
    scanner.render(success, error);
    
    // Cleanup on component unmount
    return () => {
      try {
        scanner.clear();
      } catch (error) {
        console.error("Error clearing scanner:", error);
      }
    };
  }, [navigate, sessions, setCurrentSession]);
  
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
        
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-xl text-center">
              Scan Session QR Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!scanResult && (
              <div id="qr-reader" className="w-full"></div>
            )}
            
            {scanResult && (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-4">QR Code detected. Searching for matching session...</p>
                <Button 
                  onClick={() => window.location.reload()}
                  className="bg-photobooth-primary hover:bg-photobooth-primary-dark"
                >
                  Scan Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default QRScannerPage;
