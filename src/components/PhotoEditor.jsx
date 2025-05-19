
import React, { useState, useRef, useEffect } from 'react';
import { fabric } from 'fabric';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Crop,
  RotateCcw,
  RotateCw,
  Contrast,
  SunMedium,
  Loader,
  Image as ImageIcon,
  Square,
  Film,
  LayoutGrid,
  Scissors,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// Sample images for filters preview
const sampleImages = {
  vintage: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG5hdHVyZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80",
  grayscale: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fG5hdHVyZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80",
  dramatic: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fG5hdHVyZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80",
  warm: "https://images.unsplash.com/photo-1500673922987-e212871fec22?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fG5hdHVyZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80",
  cool: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fHBldHN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=100&h=100&q=80",
};

// Define interface for border types to fix TypeScript errors
const BORDERS = {
  none: { name: "None" },
  thin: { name: "Thin", width: 5, color: "#000000" },
  thick: { name: "Thick", width: 20, color: "#000000" },
  white: { name: "White", width: 15, color: "#FFFFFF" },
  shadow: { name: "Shadow", width: 0, shadow: true },
};

// Predefined filters
const FILTERS = {
  none: { name: "None", filter: [] },
  vintage: { name: "Vintage", filter: [{ sepia: 0.5 }, { contrast: 0.2 }] },
  grayscale: { name: "B&W", filter: [{ grayscale: 1 }] },
  dramatic: { name: "Dramatic", filter: [{ contrast: 0.4 }, { brightness: -0.1 }] },
  warm: { name: "Warm", filter: [{ brightness: 0.1 }, { saturation: 0.3 }] },
  cool: { name: "Cool", filter: [{ brightness: 0.1 }, { saturation: -0.2 }] },
};

// Image sizes with aspect ratios
const IMAGE_SIZES = {
  "4x6": { name: "4×6", scale: 0.8, aspectRatio: 1.5 },
  "6x8": { name: "6×8", scale: 0.9, aspectRatio: 1.33 },
  "8x10": { name: "8×10", scale: 1.0, aspectRatio: 1.25 },
  "custom": { name: "Custom", scale: 1.1, aspectRatio: null },
};

const PhotoEditor = ({ imageUrl, onSave, onCancel }) => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAdjustment, setActiveAdjustment] = useState(null);
  const [adjustmentValues, setAdjustmentValues] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
  });
  const [activeFilter, setActiveFilter] = useState("none");
  const [activeBorder, setActiveBorder] = useState("none");
  const [activeSize, setActiveSize] = useState("4x6");
  const [uploadHistory, setUploadHistory] = useState([]);
  const [isCropping, setIsCropping] = useState(false);
  const [cropRect, setCropRect] = useState(null);
  const isMobile = useIsMobile();
  
  // Initialize the canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Clean up any existing canvas instance to prevent memory leaks
    if (canvas) {
      canvas.dispose();
    }
    
    // Create a new canvas instance
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: isMobile ? 300 : 600,
      height: isMobile ? 225 : 450,
      backgroundColor: '#f3f3f3',
    });
    
    setCanvas(fabricCanvas);
    
    return () => {
      fabricCanvas.dispose();
    };
  }, [isMobile]);
  
  // Load the image into the canvas
  useEffect(() => {
    if (!canvas || !imageUrl) return;
    
    setIsLoading(true);
    
    // Clear any existing objects before loading a new image
    canvas.clear();
    
    // Load the image and add it to canvas
    fabric.Image.fromURL(imageUrl, (fabricImg) => {
      const imgWidth = fabricImg.width || 0;
      const imgHeight = fabricImg.height || 0;
      const imgAspect = imgWidth / imgHeight;
      const canvasAspect = canvas.width / canvas.height;
      
      let scaleFactor = 1;
      if (imgAspect > canvasAspect) {
        scaleFactor = canvas.width / imgWidth;
      } else {
        scaleFactor = canvas.height / imgHeight;
      }
      
      // Apply size adjustment based on selected size
      const sizeSettings = IMAGE_SIZES[activeSize];
      const sizeAdjustment = sizeSettings.scale;
      scaleFactor = scaleFactor * sizeAdjustment;
      
      fabricImg.scale(scaleFactor * 0.9);
      
      // Center the image on the canvas
      fabricImg.set({
        originX: 'center',
        originY: 'center',
        left: canvas.width / 2,
        top: canvas.height / 2,
      });
      
      // Add to upload history
      const historyItem = {
        url: imageUrl,
        date: new Date().toLocaleString(),
      };
      setUploadHistory(prev => [...prev, historyItem]);
      
      // Add the image to the canvas
      canvas.add(fabricImg);
      
      // Apply any filters or borders
      applyFiltersAndBorders(fabricImg);
      
      canvas.renderAll();
      setIsLoading(false);
    }, { crossOrigin: 'anonymous' });
  }, [canvas, imageUrl, activeSize]);
  
  // Apply filters and borders when they change
  useEffect(() => {
    if (!canvas) return;
    
    const objects = canvas.getObjects();
    if (objects.length > 0) {
      const img = objects[0];
      applyFiltersAndBorders(img);
    }
  }, [canvas, activeFilter, activeBorder, adjustmentValues]);
  
  // Apply filters and borders to image
  const applyFiltersAndBorders = (img) => {
    if (!img) return;
    
    // Clear existing filters
    img.filters = [];
    
    // Apply adjustment filters
    if (adjustmentValues.brightness !== 0) {
      img.filters.push(new fabric.Image.filters.Brightness({
        brightness: adjustmentValues.brightness / 100
      }));
    }
    
    if (adjustmentValues.contrast !== 0) {
      img.filters.push(new fabric.Image.filters.Contrast({
        contrast: adjustmentValues.contrast / 100
      }));
    }
    
    if (adjustmentValues.saturation !== 0) {
      img.filters.push(new fabric.Image.filters.Saturation({
        saturation: adjustmentValues.saturation / 100
      }));
    }
    
    // Apply preset filter if selected
    if (activeFilter !== "none") {
      const filterSettings = FILTERS[activeFilter].filter;
      
      filterSettings.forEach(setting => {
        const filterType = Object.keys(setting)[0];
        const value = setting[filterType];
        
        switch(filterType) {
          case 'grayscale':
            img.filters.push(new fabric.Image.filters.Grayscale());
            break;
          case 'sepia':
            img.filters.push(new fabric.Image.filters.Sepia());
            break;
          case 'brightness':
            img.filters.push(new fabric.Image.filters.Brightness({
              brightness: value
            }));
            break;
          case 'contrast':
            img.filters.push(new fabric.Image.filters.Contrast({
              contrast: value
            }));
            break;
          case 'saturation':
            img.filters.push(new fabric.Image.filters.Saturation({
              saturation: value
            }));
            break;
          default:
            break;
        }
      });
    }
    
    // Apply filters to the image
    img.applyFilters();
    
    // Apply border if selected
    const border = BORDERS[activeBorder];
    if (border && border.width) {
      img.set({
        stroke: border.color,
        strokeWidth: border.width,
      });
    } else {
      img.set({
        stroke: undefined,
        strokeWidth: 0,
      });
    }
    
    // Apply shadow if needed
    if (border && border.shadow) {
      img.set({
        shadow: new fabric.Shadow({
          color: 'rgba(0,0,0,0.3)',
          blur: 10,
          offsetX: 5,
          offsetY: 5
        })
      });
    } else {
      img.set({
        shadow: null
      });
    }
    
    if (canvas) {
      canvas.renderAll();
    }
  };
  
  // Handle image crop
  const handleCrop = () => {
    if (!canvas) return;
    
    if (!isCropping) {
      // Start cropping mode
      setIsCropping(true);
      
      const activeObj = canvas.getObjects()[0];
      if (!activeObj) return;
      
      // Create a crop rectangle
      const rect = new fabric.Rect({
        left: canvas.width / 4,
        top: canvas.height / 4,
        width: canvas.width / 2,
        height: canvas.height / 2,
        fill: 'rgba(0,0,0,0.3)',
        stroke: '#fff',
        strokeDashArray: [5, 5],
        strokeWidth: 2,
        transparentCorners: false,
        cornerColor: 'white',
        cornerStrokeColor: '#333',
        borderColor: '#333',
        cornerSize: 10,
        padding: 0,
        cornerStyle: 'circle',
        hasRotatingPoint: false
      });
      
      canvas.add(rect);
      canvas.setActiveObject(rect);
      setCropRect(rect);
      
    } else {
      // Apply the crop
      if (cropRect) {
        const img = canvas.getObjects()[0];
        if (img && img.type === 'image') {
          const imgElement = img._element;
          const scale = img.scaleX;
          
          // Calculate crop coordinates relative to the image
          const left = (cropRect.left - img.left) / scale + img.width / 2;
          const top = (cropRect.top - img.top) / scale + img.height / 2;
          const width = cropRect.width / scale;
          const height = cropRect.height / scale;
          
          // Create a temporary canvas for cropping
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = width;
          tempCanvas.height = height;
          const ctx = tempCanvas.getContext('2d');
          
          ctx.drawImage(
            imgElement, 
            left, top, width, height,
            0, 0, width, height
          );
          
          // Convert to data URL and reload the image
          const croppedDataUrl = tempCanvas.toDataURL('image/jpeg');
          
          // Remove all objects from canvas
          canvas.clear();
          
          // Load the cropped image
          fabric.Image.fromURL(croppedDataUrl, (fabricImg) => {
            // Calculate scale to fit canvas
            const imgWidth = fabricImg.width || 0;
            const imgHeight = fabricImg.height || 0;
            const imgAspect = imgWidth / imgHeight;
            const canvasAspect = canvas.width / canvas.height;
            
            let scaleFactor = 1;
            if (imgAspect > canvasAspect) {
              scaleFactor = canvas.width / imgWidth;
            } else {
              scaleFactor = canvas.height / imgHeight;
            }
            
            fabricImg.scale(scaleFactor * 0.9);
            
            // Center the image on the canvas
            fabricImg.set({
              originX: 'center',
              originY: 'center',
              left: canvas.width / 2,
              top: canvas.height / 2,
            });
            
            canvas.add(fabricImg);
            canvas.renderAll();
          });
        }
        
        canvas.remove(cropRect);
        setCropRect(null);
      }
      
      setIsCropping(false);
    }
  };
  
  // Handle image rotation
  const handleRotate = (direction) => {
    if (!canvas) return;
    
    const angle = direction === 'clockwise' ? 90 : -90;
    const activeObj = canvas.getActiveObject();
    
    if (activeObj) {
      const currentAngle = activeObj.angle || 0;
      activeObj.rotate(currentAngle + angle);
    } else {
      // If no object is selected, rotate the first image
      const objects = canvas.getObjects();
      if (objects.length > 0) {
        const obj = objects[0];
        const currentAngle = obj.angle || 0;
        obj.rotate(currentAngle + angle);
      }
    }
    
    canvas.renderAll();
  };
  
  // Handle slider adjustments
  const handleAdjustmentChange = (value) => {
    if (!activeAdjustment || !canvas) return;
    
    const newValues = { ...adjustmentValues };
    newValues[activeAdjustment] = value[0];
    setAdjustmentValues(newValues);
  };
  
  // Handle filter change
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };
  
  // Handle border change
  const handleBorderChange = (border) => {
    setActiveBorder(border);
  };
  
  // Handle size change
  const handleSizeChange = (size) => {
    if (size === activeSize) return;
    
    setActiveSize(size);
    
    // Reload the image with new size
    if (canvas) {
      const objects = canvas.getObjects().filter(obj => obj.type === 'image');
      if (objects.length > 0) {
        canvas.remove(objects[0]);
        
        // This will trigger the useEffect to reload the image with the new size
        setIsLoading(true);
        
        // Reloading the image
        fabric.Image.fromURL(imageUrl, (fabricImg) => {
          const imgWidth = fabricImg.width || 0;
          const imgHeight = fabricImg.height || 0;
          const imgAspect = imgWidth / imgHeight;
          const canvasAspect = canvas.width / canvas.height;
          
          let scaleFactor = 1;
          if (imgAspect > canvasAspect) {
            scaleFactor = canvas.width / imgWidth;
          } else {
            scaleFactor = canvas.height / imgHeight;
          }
          
          // Apply size adjustment
          const sizeAdjustment = IMAGE_SIZES[size].scale;
          scaleFactor = scaleFactor * sizeAdjustment;
          
          fabricImg.scale(scaleFactor * 0.9);
          
          fabricImg.set({
            originX: 'center',
            originY: 'center',
            left: canvas.width / 2,
            top: canvas.height / 2,
          });
          
          // If we have a specific aspect ratio, apply it
          if (IMAGE_SIZES[size].aspectRatio) {
            const aspectRatio = IMAGE_SIZES[size].aspectRatio;
            const originalWidth = fabricImg.width * fabricImg.scaleX;
            const originalHeight = fabricImg.height * fabricImg.scaleY;
            
            // Maintain the largest dimension and adjust the other based on aspect ratio
            if (originalWidth > originalHeight * aspectRatio) {
              // Width is larger than it should be
              const newWidth = originalHeight * aspectRatio;
              fabricImg.scaleToWidth(newWidth);
            } else {
              // Height is larger than it should be
              const newHeight = originalWidth / aspectRatio;
              fabricImg.scaleToHeight(newHeight);
            }
          }
          
          canvas.add(fabricImg);
          applyFiltersAndBorders(fabricImg);
          canvas.renderAll();
          setIsLoading(false);
        }, { crossOrigin: 'anonymous' });
      }
    }
  };
  
  // Handle save button click
  const handleSave = () => {
    if (!canvas) return;
    
    try {
      // Convert canvas to image URL
      const dataURL = canvas.toDataURL({
        format: 'jpeg',
        quality: 0.8,
      });
      
      onSave(dataURL);
    } catch (error) {
      console.error("Error saving image: ", error);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-w-4xl mx-auto">
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold text-photobooth-primary">Photo Editor</h2>
        <p className="text-sm text-gray-500">Edit your photo before adding it to your bundle</p>
      </div>
      
      <div className="relative border rounded-lg overflow-hidden bg-gray-100 mb-4">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
            <Loader className="animate-spin text-photobooth-primary" />
          </div>
        )}
        <canvas ref={canvasRef} className="w-full" />
      </div>
      
      <Tabs defaultValue="adjust" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="adjust" className="flex items-center gap-1">
            <Contrast className="w-4 h-4" />
            <span className={isMobile ? "hidden" : ""}>Adjust</span>
          </TabsTrigger>
          <TabsTrigger value="filters" className="flex items-center gap-1">
            <Film className="w-4 h-4" />
            <span className={isMobile ? "hidden" : ""}>Filters</span>
          </TabsTrigger>
          <TabsTrigger value="borders" className="flex items-center gap-1">
            <Square className="w-4 h-4" />
            <span className={isMobile ? "hidden" : ""}>Borders</span>
          </TabsTrigger>
          <TabsTrigger value="size" className="flex items-center gap-1">
            <LayoutGrid className="w-4 h-4" />
            <span className={isMobile ? "hidden" : ""}>Size</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="adjust" className="space-y-4">
          <div className={`flex ${isMobile ? 'flex-wrap' : ''} gap-2 mb-3`}>
            <Button 
              variant={isCropping ? 'default' : 'outline'} 
              onClick={handleCrop}
              className="flex items-center gap-1"
              size={isMobile ? 'sm' : 'default'}
            >
              <Scissors className="w-4 h-4" />
              <span>{isMobile ? '' : (isCropping ? 'Apply Crop' : 'Crop Tool')}</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => handleRotate('counterclockwise')}
              className="flex items-center gap-1"
              size={isMobile ? 'sm' : 'default'}
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isMobile ? '' : 'Rotate Left'}</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => handleRotate('clockwise')}
              className="flex items-center gap-1"
              size={isMobile ? 'sm' : 'default'}
            >
              <RotateCw className="w-4 h-4" />
              <span>{isMobile ? '' : 'Rotate Right'}</span>
            </Button>
            
            <Button 
              variant={activeAdjustment === 'brightness' ? 'default' : 'outline'} 
              onClick={() => setActiveAdjustment(activeAdjustment === 'brightness' ? null : 'brightness')}
              className="flex items-center gap-1"
              size={isMobile ? 'sm' : 'default'}
            >
              <SunMedium className="w-4 h-4" />
              <span>{isMobile ? '' : 'Brightness'}</span>
            </Button>
            
            <Button 
              variant={activeAdjustment === 'contrast' ? 'default' : 'outline'} 
              onClick={() => setActiveAdjustment(activeAdjustment === 'contrast' ? null : 'contrast')}
              className="flex items-center gap-1"
              size={isMobile ? 'sm' : 'default'}
            >
              <Contrast className="w-4 h-4" />
              <span>{isMobile ? '' : 'Contrast'}</span>
            </Button>
            
            <Button 
              variant={activeAdjustment === 'saturation' ? 'default' : 'outline'} 
              onClick={() => setActiveAdjustment(activeAdjustment === 'saturation' ? null : 'saturation')}
              className="flex items-center gap-1"
              size={isMobile ? 'sm' : 'default'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v5" />
                <path d="M19 6l-3 5" />
                <path d="M19 18l-3-5" />
                <path d="M12 22v-5" />
                <path d="M5 18l3-5" />
                <path d="M5 6l3 5" />
              </svg>
              <span>{isMobile ? '' : 'Saturation'}</span>
            </Button>
          </div>
          
          {activeAdjustment && (
            <div className="py-2">
              <label className="block text-sm font-medium mb-1 capitalize">
                {activeAdjustment} ({adjustmentValues[activeAdjustment]})
              </label>
              <Slider
                defaultValue={[adjustmentValues[activeAdjustment]]}
                min={-100}
                max={100}
                step={1}
                onValueChange={handleAdjustmentChange}
                className="w-full"
              />
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="filters">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {Object.keys(FILTERS).map((filter) => (
              <div key={filter} className="text-center">
                <button
                  onClick={() => handleFilterChange(filter)}
                  className={`w-full aspect-square rounded-md border-2 mb-1 ${
                    activeFilter === filter 
                      ? 'border-photobooth-primary' 
                      : 'border-transparent'
                  } overflow-hidden`}
                >
                  {filter !== 'none' && sampleImages[filter] ? (
                    <img 
                      src={sampleImages[filter]} 
                      alt={filter}
                      className={`w-full h-full object-cover ${
                        filter === 'grayscale' ? 'grayscale' : 
                        filter === 'vintage' ? 'sepia contrast-125' : 
                        filter === 'warm' ? 'brightness-110 contrast-110 saturate-150' : 
                        filter === 'cool' ? 'brightness-110 saturate-75 hue-rotate-30' : 
                        filter === 'dramatic' ? 'contrast-150 brightness-75' : ''
                      }`}
                    />
                  ) : (
                    <div className={`w-full h-full bg-gray-200 flex items-center justify-center`}>
                      <ImageIcon className="text-gray-400" size={24} />
                    </div>
                  )}
                </button>
                <span className="text-xs text-gray-600">{FILTERS[filter].name}</span>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="borders">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {Object.keys(BORDERS).map((border) => (
              <div key={border} className="text-center">
                <button
                  onClick={() => handleBorderChange(border)}
                  className={`w-full aspect-square rounded-md ${
                    activeBorder === border 
                      ? 'ring-2 ring-photobooth-primary' 
                      : ''
                  } overflow-hidden`}
                >
                  <div className={`w-full h-full bg-gray-100 flex items-center justify-center p-2 ${
                    border === 'shadow' ? 'shadow-lg' : ''
                  }`}>
                    <div 
                      className={`w-full h-full ${
                        border === 'none' ? '' : 
                        border === 'thin' ? 'border-2 border-black' : 
                        border === 'thick' ? 'border-4 border-black' : 
                        border === 'white' ? 'border-4 border-white shadow-sm' : ''
                      } flex items-center justify-center`}
                    >
                      <ImageIcon className="text-gray-400" size={20} />
                    </div>
                  </div>
                </button>
                <span className="text-xs text-gray-600 mt-1">{BORDERS[border].name}</span>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="size">
          <RadioGroup 
            value={activeSize}
            onValueChange={handleSizeChange}
            className="flex flex-col space-y-2"
          >
            {Object.keys(IMAGE_SIZES).map((size) => (
              <div key={size} className="flex items-center space-x-2">
                <RadioGroupItem value={size} id={`size-${size}`} />
                <Label htmlFor={`size-${size}`} className="flex items-center">
                  <span className="mr-2">{IMAGE_SIZES[size].name}</span>
                  <span className="text-xs text-gray-500">
                    {IMAGE_SIZES[size].aspectRatio 
                      ? `(Aspect ratio: ${IMAGE_SIZES[size].aspectRatio}:1)` 
                      : '(Free size)'}
                  </span>
                </Label>
              </div>
            ))}
          </RadioGroup>
          
          <div className="mt-4 bg-gray-50 p-3 rounded-md">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Upload History</h4>
            {uploadHistory.length === 0 ? (
              <p className="text-xs text-gray-500">No history yet</p>
            ) : (
              <div className="max-h-32 overflow-y-auto text-xs">
                {uploadHistory.map((item, index) => (
                  <div key={index} className="flex justify-between py-1 border-b border-gray-100 last:border-b-0">
                    <span className="text-gray-600">Image {index + 1}</span>
                    <span className="text-gray-400">{item.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <Separator className="my-4" />
      
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          className="bg-photobooth-primary hover:bg-photobooth-primary-dark"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default PhotoEditor;
