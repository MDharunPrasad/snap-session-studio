
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { usePhotoBoothContext } from '@/context/PhotoBoothContext';
import { QrCode, Camera } from 'lucide-react';
import Header from '@/components/Header';

const QRScannerPage = () => {
  const [scanning, setScanning] = useState(false);
  const [permission, setPermission] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const { sessions, setCurrentSession } = usePhotoBoothContext();
  
  // Start camera when scanning is enabled
  useEffect(() => {
    let stream = null;
    
    if (scanning) {
      // Request camera access
      navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      .then(videoStream => {
        setPermission(true);
        stream = videoStream;
        if (videoRef.current) {
          videoRef.current.srcObject = videoStream;
        }
      })
      .catch(error => {
        console.error('Error accessing camera:', error);
        toast({
          title: "Camera Access Denied",
          description: "Please allow camera access to scan QR codes.",
          variant: "destructive"
        });
        setScanning(false);
        setPermission(false);
      });
    } else if (stream) {
      // Stop camera when not scanning
      stream.getTracks().forEach(track => track.stop());
    }
    
    return () => {
      // Clean up camera on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [scanning, toast]);
  
  const handleStartScan = () => {
    setScanning(true);
  };
  
  const handleStopScan = () => {
    setScanning(false);
  };
  
  // This function would be integrated with an actual QR code library in production
  const handleManualSessionId = (sessionId) => {
    const session = sessions.find(s => s.id === sessionId);
    
    if (session) {
      setCurrentSession(session);
      toast({
        title: "Session Found",
        description: `Loaded session for ${session.name}`,
      });
      navigate(`/session/${sessionId}`);
    } else {
      toast({
        title: "Session Not Found",
        description: "No session found with that ID.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-photobooth-primary flex items-center mb-6">
            <QrCode className="mr-2 h-6 w-6" />
            QR Code Scanner
          </h1>
          
          <Card className="overflow-hidden shadow-lg">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-photobooth-primary to-blue-500 text-white p-4">
                <h2 className="text-lg font-semibold">
                  Scan QR Code to View Gallery
                </h2>
                <p className="text-sm opacity-90">
                  Point your camera at a session QR code to access the photo gallery
                </p>
              </div>
              
              {scanning ? (
                <div className="relative">
                  <div className="w-full aspect-square bg-black flex items-center justify-center">
                    <video 
                      ref={videoRef} 
                      className="w-full h-full object-cover"
                      autoPlay 
                      playsInline
                    />
                    <div className="absolute inset-0 border-2 border-white/50 m-8 pointer-events-none"></div>
                  </div>
                  <Button
                    onClick={handleStopScan}
                    variant="destructive"
                    className="absolute bottom-4 right-4"
                  >
                    Stop Scan
                  </Button>
                </div>
              ) : (
                <div className="p-6 flex flex-col items-center">
                  <div className="bg-gray-100 rounded-lg p-8 mb-4 w-full max-w-[240px] aspect-square flex items-center justify-center">
                    <Camera className="h-12 w-12 text-gray-400" />
                  </div>
                  
                  <Button 
                    onClick={handleStartScan}
                    className="w-full bg-photobooth-primary hover:bg-photobooth-primary-dark my-4"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Start Camera
                  </Button>
                  
                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-500 mb-2">For testing, enter a session ID:</p>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => handleManualSessionId(sessions.length > 0 ? sessions[0].id : 'test-session')}
                        className="text-xs"
                      >
                        Test Session
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="mt-6 text-center text-gray-500 text-sm">
            <p>QR codes are attached to each session receipt</p>
            <p>Customers can scan these codes to view and download their photos</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScannerPage;
