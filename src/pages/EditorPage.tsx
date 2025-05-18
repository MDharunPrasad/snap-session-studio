
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { usePhotoBoothContext } from '@/context/PhotoBoothContext';
import Header from '@/components/Header';
import PhotoEditor from '@/components/PhotoEditor';
import { Plus, Edit, ArrowLeft, ArrowRight, Image, Clock, Trash2 } from 'lucide-react';
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EditorPage = () => {
  const { currentSession, addPhoto, updatePhoto, deletePhoto } = usePhotoBoothContext();
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [editingPhotoIndex, setEditingPhotoIndex] = useState(null);
  const [activeTab, setActiveTab] = useState("photos");
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // If no active session, redirect to home
  useEffect(() => {
    if (!currentSession || !currentSession.bundle) {
      toast({
        title: "Missing Session or Bundle",
        description: "Please start a new session and select a bundle first.",
        variant: "destructive"
      });
      navigate('/');
    } else if (currentSession.photos) {
      // Load existing photos from session
      const sessionPhotos = currentSession.photos.map(p => p.url);
      setUploadedPhotos(sessionPhotos);
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
              edited: false,
              timestamp: new Date().toISOString()
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
        edited: true,
        lastEdited: new Date().toISOString()
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
  
  const handleDeletePhoto = (index) => {
    if (!currentSession) return;
    
    // Get the photo ID
    const photoId = currentSession.photos[index]?.id;
    if (photoId) {
      // Remove from session
      deletePhoto(currentSession.id, photoId);
      
      // Update local state
      const newPhotos = [...uploadedPhotos];
      newPhotos.splice(index, 1);
      setUploadedPhotos(newPhotos);
      
      toast({
        title: "Photo Deleted",
        description: "The photo has been removed from your session.",
      });
    }
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
  const placeholders = Array(typeof bundleCount === 'string' ? 999 : parseInt(bundleCount, 10)).fill(null);
  
  // Sort photos by upload time for history view
  const sortedPhotos = currentSession.photos ? 
    [...currentSession.photos].sort((a, b) => 
      new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
    ) : [];

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
              
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <Badge variant="outline" className="bg-blue-100 text-photobooth-primary border-none px-3 py-1">
                  {currentSession.name}
                </Badge>
                <Badge variant="outline" className="bg-purple-100 text-purple-700 border-none px-3 py-1">
                  {currentSession.location}
                </Badge>
                <Badge variant="outline" className="bg-green-100 text-green-700 border-none px-3 py-1">
                  {uploadedPhotos.length} / {bundleCount === "unlimited" ? "∞" : bundleCount} Photos
                </Badge>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="photos" className="flex items-center gap-1">
                  <Image className="w-4 h-4" />
                  <span>Upload Photos</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Upload History</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="photos">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {placeholders.slice(0, uploadedPhotos.length + 1).map((_, index) => (
                    <Card key={index} className="overflow-hidden hover:shadow-lg transition-all">
                      <CardContent className="p-0">
                        <div 
                          className="aspect-[4/3] relative bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center"
                        >
                          {uploadedPhotos[index] ? (
                            <div className="relative w-full h-full group">
                              <img 
                                src={uploadedPhotos[index]} 
                                alt={`Photo ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => handleEditPhoto(index)}
                                      className="bg-white text-photobooth-primary p-2 rounded-full hover:bg-gray-100"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <label 
                                      htmlFor={`photo-upload-${index}`}
                                      className="bg-white text-gray-700 p-2 rounded-full hover:bg-gray-100 cursor-pointer"
                                    >
                                      <Image className="h-4 w-4" />
                                    </label>
                                  </div>
                                  <button
                                    onClick={() => handleDeletePhoto(index)}
                                    className="bg-white text-red-500 p-2 rounded-full hover:bg-gray-100"
                                  >
                                    <Trash2 className="h-4 w-4" />
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
              </TabsContent>
              
              <TabsContent value="history">
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <h3 className="text-lg font-medium mb-3">Upload History</h3>
                  {sortedPhotos.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                      No photos uploaded yet
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-auto pr-2">
                      {sortedPhotos.map((photo, index) => (
                        <div key={photo.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50">
                          <div className="w-16 h-12 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                            <img src={photo.url} alt={`Thumbnail ${index}`} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">Photo {index + 1}</div>
                            <div className="text-xs text-gray-500">
                              {photo.timestamp ? new Date(photo.timestamp).toLocaleString() : 'Unknown date'}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-photobooth-primary p-2 h-auto"
                              onClick={() => {
                                const photoIndex = currentSession.photos.findIndex(p => p.id === photo.id);
                                if (photoIndex !== -1) {
                                  handleEditPhoto(photoIndex);
                                }
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-500 p-2 h-auto"
                              onClick={() => {
                                const photoIndex = currentSession.photos.findIndex(p => p.id === photo.id);
                                if (photoIndex !== -1) {
                                  handleDeletePhoto(photoIndex);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            
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
                <strong>Tip:</strong> Upload your photos and click "Edit" to access the photo editor with features like filters, borders, 
                brightness, contrast, and saturation adjustments. Customize the image size with the size options.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EditorPage;
