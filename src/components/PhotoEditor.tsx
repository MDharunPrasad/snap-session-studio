
import React, { useState, useRef, useEffect } from 'react';
import { fabric } from 'fabric'; // Correct import syntax for fabric.js
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Crop,
  RotateCcw,
  RotateCw,
  Contrast,
  SunMedium,
  Loader,
  ImageIcon,
  Square,
  Film,
  LayoutGrid,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface PhotoEditorProps {
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
  onCancel: () => void;
}

// Predefined filters
const FILTERS = {
  none: { name: "None", filter: [] },
  vintage: { name: "Vintage", filter: [{ sepia: 0.5 }, { contrast: 0.2 }] },
  grayscale: { name: "B&W", filter: [{ grayscale: 1 }] },
  dramatic: { name: "Dramatic", filter: [{ contrast: 0.4 }, { brightness: -0.1 }] },
  warm: { name: "Warm", filter: [{ brightness: 0.1 }, { saturation: 0.3 }] },
  cool: { name: "Cool", filter: [{ brightness: 0.1 }, { saturation: -0.2 }] },
};

// Border styles
const BORDERS = {
  none: { name: "None" },
  thin: { name: "Thin", width: 5, color: "#000000" },
  thick: { name: "Thick", width: 20, color: "#000000" },
  white: { name: "White", width: 15, color: "#FFFFFF" },
  shadow: { name: "Shadow", width: 0, shadow: true },
};

// Image sizes
const IMAGE_SIZES = {
  small: { name: "Small", scale: 0.7 },
  medium: { name: "Medium", scale: 0.9 },
  large: { name: "Large", scale: 1.1 },
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
  const [activeSize, setActiveSize] = useState("medium");
  const [uploadHistory, setUploadHistory] = useState([]);
  const isMobile = useIsMobile();
  
  // Initialize the canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Correct initialization for Fabric.js
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
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    
    img.onload = () => {
      // Calculate aspect ratio to fit within canvas
      const imgAspect = img.width / img.height;
      const canvasAspect = canvas.width / canvas.height;
      
      let scaleFactor = 1;
      if (imgAspect > canvasAspect) {
        scaleFactor = canvas.width / img.width;
      } else {
        scaleFactor = canvas.height / img.height;
      }
      
      // Apply size adjustment
      const sizeAdjustment = IMAGE_SIZES[activeSize].scale;
      scaleFactor = scaleFactor * sizeAdjustment;
      
      // Create a fabric image and add it to the canvas
      fabric.Image.fromURL(imageUrl, (fabricImg) => {
        fabricImg.scale(scaleFactor * 0.9);
        
        // Center the image on the canvas
        fabricImg.set({
          originX: 'center',
          originY: 'center',
          left: canvas.width / 2,
          top: canvas.height / 2,
        });
        
        canvas.clear();
        canvas.add(fabricImg);
        
        // Add to upload history
        const historyItem = {
          url: imageUrl,
          date: new Date().toLocaleString(),
        };
        setUploadHistory(prev => [...prev, historyItem]);
        
        applyFiltersAndBorders(fabricImg);
        
        canvas.renderAll();
        setIsLoading(false);
      });
    };
    
    img.onerror = () => {
      console.error("Error loading image");
      setIsLoading(false);
    };
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
    if (activeFilter !== "none" && FILTERS[activeFilter]) {
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
    
    // In a real implementation, this would use fabric.js crop functionality
    console.log("Crop functionality would be implemented here");
    // For now, just toggle the active adjustment
    setActiveAdjustment(activeAdjustment === 'crop' ? null : 'crop');
  };
  
  // Handle image rotation
  const handleRotate = (direction) => {
    if (!canvas) return;
    
    const angle = direction === 'clockwise' ? 90 : -90;
    const activeObj = canvas.getActiveObject();
    
    if (activeObj) {
      activeObj.rotate((activeObj.angle || 0) + angle);
    } else {
      // If no object is selected, rotate the first image
      const objects = canvas.getObjects();
      if (objects.length > 0) {
        objects[0].rotate((objects[0].angle || 0) + angle);
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
    setActiveSize(size);
    
    // Reload the image with new size
    if (canvas) {
      const objects = canvas.getObjects();
      if (objects.length > 0) {
        canvas.remove(objects[0]);
        
        // This will trigger the useEffect to reload the image with the new size
        const tempUrl = imageUrl;
        setIsLoading(true);
        setTimeout(() => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = tempUrl;
          
          img.onload = () => {
            const imgAspect = img.width / img.height;
            const canvasAspect = canvas.width / canvas.height;
            
            let scaleFactor = 1;
            if (imgAspect > canvasAspect) {
              scaleFactor = canvas.width / img.width;
            } else {
              scaleFactor = canvas.height / img.height;
            }
            
            // Apply size adjustment
            const sizeAdjustment = IMAGE_SIZES[size].scale;
            scaleFactor = scaleFactor * sizeAdjustment;
            
            fabric.Image.fromURL(tempUrl, (fabricImg) => {
              fabricImg.scale(scaleFactor * 0.9);
              
              fabricImg.set({
                originX: 'center',
                originY: 'center',
                left: canvas.width / 2,
                top: canvas.height / 2,
              });
              
              canvas.add(fabricImg);
              applyFiltersAndBorders(fabricImg);
              canvas.renderAll();
              setIsLoading(false);
            });
          };
          
          img.onerror = () => {
            console.error("Error reloading image");
            setIsLoading(false);
          };
        }, 100);
      }
    }
  };
  
  // Handle save button click
  const handleSave = () => {
    if (!canvas) return;
    
    // Convert canvas to image URL
    const dataURL = canvas.toDataURL({
      format: 'jpeg',
      quality: 0.8,
    });
    
    onSave(dataURL);
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
              variant={activeAdjustment === 'crop' ? 'default' : 'outline'} 
              onClick={handleCrop}
              className="flex items-center gap-1"
              size={isMobile ? 'sm' : 'default'}
            >
              <Crop className="w-4 h-4" />
              <span>{isMobile ? '' : 'Crop'}</span>
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
                  <div className={`w-full h-full bg-gray-200 flex items-center justify-center ${
                    filter === 'grayscale' ? 'grayscale' : 
                    filter === 'vintage' ? 'sepia' : 
                    filter === 'warm' ? 'brightness-110' : 
                    filter === 'cool' ? 'brightness-110 hue-rotate-90' : 
                    filter === 'dramatic' ? 'contrast-125' : ''
                  }`}>
                    <ImageIcon className="text-gray-400" size={24} />
                  </div>
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
                    {size === 'small' ? '(70%)' : size === 'medium' ? '(90%)' : '(110%)'}
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
