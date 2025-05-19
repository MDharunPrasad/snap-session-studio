
import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { usePhotoBoothContext } from "@/context/PhotoBoothContext";
import Header from "@/components/Header";

const QRScannerPage = () => {
  const [scanResult, setScanResult] = useState(null);
  const { toast } = useToast();
  const { sessions, setCurrentSession } = usePhotoBoothContext();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize QR scanner
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 },
      /* verbose= */ false
    );

    let mounted = true;

    function onScanSuccess(decodedText) {
      if (!mounted) return;

      // Assuming the QR code contains a session ID
      const sessionId = decodedText.trim();
      
      // Try to find the session
      const session = sessions.find(s => s.id === sessionId);
      
      if (session) {
        setScanResult(decodedText);
        toast({
          title: "Session Found!",
          description: `Found session for ${session.name}`,
        });
        
        // Set as current session and navigate to editor or bundles page
        setCurrentSession(session);
        
        // Clear scanner
        scanner.clear();
        
        // Navigate to appropriate page based on session state
        if (session.bundle) {
          navigate("/editor");
        } else {
          navigate("/bundles");
        }
      } else {
        toast({
          title: "Invalid QR Code",
          description: "No matching session found for this QR code.",
          variant: "destructive"
        });
      }
    }

    function onScanFailure(error) {
      // Non-critical errors are silently handled
      console.warn(`QR scan error: ${error}`);
    }

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      mounted = false;
      scanner.clear();
    };
  }, [sessions, navigate, setCurrentSession, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-xl mx-auto">
          <Card className="shadow-lg border-2 border-photobooth-primary/20 rounded-md overflow-hidden">
            <CardHeader className="bg-blue-100/50 border-b border-photobooth-primary/10 py-4">
              <CardTitle className="text-xl font-bold text-photobooth-primary">
                QR Code Scanner
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {scanResult ? (
                <div className="text-center py-4">
                  <div className="text-lg font-medium text-green-600 mb-2">
                    Scan successful!
                  </div>
                  <p className="text-gray-600 mb-4">
                    Session ID: {scanResult}
                  </p>
                  <div className="animate-pulse">
                    <p className="text-gray-600">Redirecting...</p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-4 text-center">
                    Position a QR code in the scanning area to retrieve a photo session.
                  </p>
                  <div id="qr-reader" className="w-full max-w-sm mx-auto mb-4"></div>
                  <div className="flex justify-center">
                    <Button 
                      variant="outline"
                      onClick={() => navigate("/")}
                      className="mt-2"
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-md border border-blue-100 shadow-sm mt-6">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Make sure the QR code is well lit and centered in the scanning area for best results.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QRScannerPage;
