
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { usePhotoBoothContext } from '@/context/PhotoBoothContext';
import Header from '@/components/Header';
import PhotoEditor from '@/components/PhotoEditor';
import { Plus, Edit, ArrowLeft, ArrowRight } from 'lucide-react';
import { useIsMobile } from "@/hooks/use-mobile";

const EditorPage = () => {
  const { currentSession, addPhoto, updatePhoto } = usePhotoBoothContext();
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [editingPhotoIndex, setEditingPhotoIndex] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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

  const handleFileUpload = (e, index) => {
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

  const handleEditPhoto = (index) => {
    setEditingPhotoIndex(index);
  };
  
  const handleSaveEdit = (editedImageUrl) => {
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
  const bundleCount = currentSession.bundle.count;
  const placeholders = Array(typeof bundleCount === 'string' ? 999 : bundleCount).fill(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
        {editingPhotoIndex !== null && uploadedPhotos[editingPhotoIndex] ? (
          <PhotoEditor
            imageUrl={uploadedPhotos[editingPhotoIndex]}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
          />
        ) : (
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:justify-between items-center mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-photobooth-primary mb-2 md:mb-0">
                {currentSession.bundle.name}
              </h1>
              
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-100 rounded-full text-photobooth-primary">
                  {currentSession.name}
                </span>
                <span className="px-3 py-1 bg-purple-100 rounded-full text-purple-700">
                  {currentSession.location}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {placeholders.slice(0, uploadedPhotos.length + 1).map((_, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-all">
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
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-gradient-to-b from-black/30 to-black/70 transition-opacity">
                            <div className="flex gap-2">
                              <label 
                                htmlFor={`photo-upload-${index}`}
                                className="bg-white text-photobooth-primary hover:bg-gray-100 px-3 py-1 rounded-full cursor-pointer text-sm font-medium shadow-lg"
                              >
                                Change
                              </label>
                              <button 
                                className="bg-photobooth-primary text-white hover:bg-photobooth-primary-dark px-3 py-1 rounded-full text-sm font-medium shadow-lg flex items-center"
                                onClick={() => handleEditPhoto(index)}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <label 
                          htmlFor={`photo-upload-${index}`}
                          className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors"
                        >
                          <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                            <Plus className="h-8 w-8 text-photobooth-primary" />
                          </div>
                          <div className="text-sm font-medium text-photobooth-primary">Upload Photo</div>
                          <div className="text-xs text-gray-500 mt-1">Click to browse files</div>
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
            
            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/bundles')}
                className="w-full sm:w-auto flex items-center justify-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Bundles
              </Button>
              
              <Button 
                className="w-full sm:w-auto bg-photobooth-primary hover:bg-photobooth-primary-dark flex items-center justify-center"
                onClick={handleProceedToCart}
              >
                Proceed to Cart
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-md border border-blue-100 shadow-sm">
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
