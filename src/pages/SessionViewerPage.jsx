
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { usePhotoBoothContext } from '@/context/PhotoBoothContext';
import Header from '@/components/Header';

const SessionViewerPage = () => {
  const { id } = useParams();
  const { sessions, setCurrentSession, deleteSession } = usePhotoBoothContext();
  const [session, setSession] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Find the session
  useEffect(() => {
    if (id) {
      const foundSession = sessions.find(s => s.id === id);
      if (foundSession) {
        setSession(foundSession);
      } else {
        toast({
          title: "Session Not Found",
          description: "The requested session does not exist.",
          variant: "destructive"
        });
        navigate('/');
      }
    }
  }, [id, sessions, navigate, toast]);

  const handleContinueSession = () => {
    if (session) {
      setCurrentSession(session);
      
      if (session.bundle) {
        navigate('/editor');
      } else {
        navigate('/bundles');
      }
    }
  };

  const handleDeleteSession = () => {
    if (session) {
      deleteSession(session.id);
      toast({
        title: "Session Deleted",
        description: "The photo session has been deleted."
      });
      navigate('/');
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-photobooth-primary">
              Session Details
            </h1>
            
            {session.status === 'Active' && (
              <Button 
                className="bg-photobooth-primary hover:bg-photobooth-primary-dark"
                onClick={handleContinueSession}
              >
                Continue Session
              </Button>
            )}
          </div>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Session Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500">Customer Name</dt>
                  <dd className="font-medium">{session.name}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Location</dt>
                  <dd className="font-medium">{session.location}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Date</dt>
                  <dd className="font-medium">
                    {new Date(session.date).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Status</dt>
                  <dd>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      session.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {session.status}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Session ID</dt>
                  <dd className="font-mono text-sm">{session.id}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Bundle</dt>
                  <dd className="font-medium">
                    {session.bundle 
                      ? `${session.bundle.name} (₹${session.bundle.price})` 
                      : 'No bundle selected'}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Photos</CardTitle>
            </CardHeader>
            <CardContent>
              {session.photos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No photos taken in this session yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {session.photos.map((photo, index) => (
                    <div key={photo.id} className="aspect-[4/3] bg-gray-100 rounded overflow-hidden">
                      <img 
                        src={photo.editedUrl || photo.url} 
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
            
            <Button 
              variant="destructive"
              onClick={handleDeleteSession}
            >
              Delete Session
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SessionViewerPage;
