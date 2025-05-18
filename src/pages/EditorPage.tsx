
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { usePhotoBoothContext } from '@/context/PhotoBoothContext';
import Header from '@/components/Header';
import PhotoEditor from '@/components/PhotoEditor';

const EditorPage: React.FC = () => {
  const { currentSession, addPhoto, updatePhoto } = usePhotoBoothContext();
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [editingPhotoIndex, setEditingPhotoIndex] = useState<number | null>(null);
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
  }, [currentSession, navigate, toast]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const files = e.target.files;
    
    if (files && files.length > 0) {
      const file = files[0];
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an image file.",
          variant: "destructive"
        });
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          const newPhotos = [...uploadedPhotos];
          newPhotos[index] = event.target.result;
          setUploadedPhotos(newPhotos);
          
          // Add to current session
          if (currentSession) {
            addPhoto(currentSession.id, {
              url: event.target.result,
              edited: false
            });
          }
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleEditPhoto = (index: number) => {
    setEditingPhotoIndex(index);
  };
  
  const handleSaveEdit = (editedImageUrl: string) => {
    if (editingPhotoIndex === null || !currentSession) return;
    
    // Update the local state
    const newPhotos = [...uploadedPhotos];
    newPhotos[editingPhotoIndex] = editedImageUrl;
    setUploadedPhotos(newPhotos);
    
    // Update the session photo
    const photoId = currentSession.photos[editingPhotoIndex]?.id;
    if (photoId) {
      updatePhoto(currentSession.id, photoId, {
        url: editedImageUrl,
        edited: true
      });
    }
    
    setEditingPhotoIndex(null);
    
    toast({
      title: "Photo Updated",
      description: "Your edited photo has been saved.",
    });
  };
  
  const handleCancelEdit = () => {
    setEditingPhotoIndex(null);
  };

  const handleProceedToCart = () => {
    if (uploadedPhotos.length === 0) {
      toast({
        title: "No Photos Uploaded",
        description: "Please upload at least one photo before proceeding.",
        variant: "destructive"
      });
      return;
    }
    
    navigate('/cart');
  };

  if (!currentSession || !currentSession.bundle) return null;

  // Create placeholders based on bundle size
  const placeholders = Array(currentSession.bundle.count).fill(null);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {editingPhotoIndex !== null && uploadedPhotos[editingPhotoIndex] ? (
          <PhotoEditor
            imageUrl={uploadedPhotos[editingPhotoIndex]}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
          />
        ) : (
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-photobooth-primary">
                Photo Editor: {currentSession.bundle.name}
              </h1>
              
              <div className="text-sm text-gray-600">
                Session: {currentSession.name} - {currentSession.location}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {placeholders.map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div 
                      className="aspect-[4/3] relative bg-gray-100 flex items-center justify-center"
                    >
                      {uploadedPhotos[index] ? (
                        <div className="relative w-full h-full">
                          <img 
                            src={uploadedPhotos[index]} 
                            alt={`Photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/50 transition-opacity">
                            <div className="flex gap-2">
                              <label 
                                htmlFor={`photo-upload-${index}`}
                                className="bg-photobooth-primary text-white px-3 py-1 rounded cursor-pointer"
                              >
                                Change
                              </label>
                              <button 
                                className="bg-gray-700 text-white px-3 py-1 rounded"
                                onClick={() => handleEditPhoto(index)}
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <label 
                          htmlFor={`photo-upload-${index}`}
                          className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                        >
                          <div className="text-5xl mb-2 text-gray-400">+</div>
                          <div className="text-sm text-gray-500">Upload Photo</div>
                        </label>
                      )}
                      <input
                        type="file"
                        id={`photo-upload-${index}`}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, index)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="mt-8 flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => navigate('/bundles')}
              >
                Back to Bundles
              </Button>
              
              <Button 
                className="bg-photobooth-primary hover:bg-photobooth-primary-dark"
                onClick={handleProceedToCart}
              >
                Proceed to Cart
              </Button>
            </div>
            
            <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-md border border-blue-100">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Upload your photos and click "Edit" to access the photo editor with features like crop, rotate, 
                brightness, contrast, and saturation adjustments.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EditorPage;
