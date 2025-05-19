
import React, { useState, useRef, useEffect } from 'react';
import { fabric } from 'fabric';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  RotateCcw,
  RotateCw,
  Contrast,
  SunMedium,
  Loader,
  ImageIcon,
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
  none: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGFuaW1hbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80",
  vintage: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG5hdHVyZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80",
  grayscale: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fG5hdHVyZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80",
  dramatic: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fG5hdHVyZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80",
  warm: "https://images.unsplash.com/photo-1500673922987-e212871fec22?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fG5hdHVyZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80",
  cool: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fHBldHN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=100&h=100&q=80",
};

// Border styles
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
  const fabricCanvasRef = useRef(null);
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
  const [cropRectRef, setCropRectRef] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const isMobile = useIsMobile();
  
  // Initialize the canvas - With safety checks
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Clean up any existing canvas instance
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
    }
    
    const initCanvas = () => {
      try {
        // Create canvas with fixed dimensions
        const canvasWidth = isMobile ? 300 : 600;
        const canvasHeight = isMobile ? 225 : 450;
        
        const canvas = new fabric.Canvas(canvasRef.current, {
          width: canvasWidth,
          height: canvasHeight,
          backgroundColor: '#f3f3f3',
          selection: false,  // Disable group selection
          preserveObjectStacking: true,
        });
        
        fabricCanvasRef.current = canvas;
        setCanvas(canvas);
        
        // Wait a bit to ensure the DOM is ready
        setTimeout(() => {
          if (canvas && canvas.requestRenderAll) {
            canvas.requestRenderAll();
          }
          setIsLoading(false);
        }, 100);
      } catch (err) {
        console.error("Error initializing canvas:", err);
        setIsLoading(false);
      }
    };
    
    // Small delay to ensure DOM is ready
    setTimeout(initCanvas, 50);
    
    return () => {
      if (fabricCanvasRef.current) {
        try {
          fabricCanvasRef.current.dispose();
        } catch (err) {
          console.error("Error disposing canvas:", err);
        }
      }
    };
  }, [isMobile]);
  
  // Load the image into the canvas - Only run when canvas is ready
  useEffect(() => {
    if (!canvas || !imageUrl) return;
    
    setIsLoading(true);
    
    const loadImage = () => {
      try {
        // Clear any existing objects
        canvas.clear();
        
        fabric.Image.fromURL(imageUrl, (fabricImg) => {
          if (!canvas || !fabricImg) return;
          
          setOriginalImage(fabricImg);
          
          const imgWidth = fabricImg.width || 0;
          const imgHeight = fabricImg.height || 0;
          const imgAspect = imgWidth / imgHeight;
          
          const canvasWidth = canvas.getWidth();
          const canvasHeight = canvas.getHeight();
          const canvasAspect = canvasWidth / canvasHeight;
          
          let scaleFactor = 1;
          if (imgAspect > canvasAspect) {
            scaleFactor = canvasWidth / imgWidth;
          } else {
            scaleFactor = canvasHeight / imgHeight;
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
            left: canvasWidth / 2,
            top: canvasHeight / 2,
          });
          
          // Add to upload history
          const historyItem = {
            url: imageUrl,
            date: new Date().toLocaleString(),
            size: activeSize
          };
          setUploadHistory(prev => [...prev, historyItem]);
          
          // Add the image to the canvas
          canvas.add(fabricImg);
          
          // Apply any filters or borders
          applyFiltersAndBorders(fabricImg);
          
          canvas.requestRenderAll();
          setIsLoading(false);
        }, { crossOrigin: 'anonymous' });
      } catch (err) {
        console.error("Error loading image:", err);
        setIsLoading(false);
      }
    };
    
    loadImage();
  }, [canvas, imageUrl]);
  
  // Apply filters and borders when they change
  useEffect(() => {
    if (!canvas) return;
    
    const objects = canvas.getObjects();
    if (objects && objects.length > 0) {
      const img = objects[0];
      applyFiltersAndBorders(img);
    }
  }, [canvas, activeFilter, activeBorder, adjustmentValues]);
  
  // Apply filters and borders to image
  const applyFiltersAndBorders = (img) => {
    if (!img || !canvas) return;
    
    try {
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
      
      canvas.requestRenderAll();
    } catch (err) {
      console.error("Error applying filters:", err);
    }
  };
  
  // Handle crop feature
  const handleCrop = () => {
    if (!canvas) return;
    
    try {
      if (!isCropping) {
        // Start cropping mode
        setIsCropping(true);
        
        // Get the current image
        const image = canvas.getObjects()[0];
        if (!image) return;
        
        // Create crop rectangle
        const imgWidth = image.getScaledWidth();
        const imgHeight = image.getScaledHeight();
        
        // Make the crop area slightly smaller than the image
        const cropWidth = imgWidth * 0.8;
        const cropHeight = imgHeight * 0.8;
        
        const rect = new fabric.Rect({
          left: image.left - cropWidth/2,
          top: image.top - cropHeight/2,
          width: cropWidth,
          height: cropHeight,
          fill: 'rgba(0,0,0,0)',
          stroke: '#fff',
          strokeWidth: 2,
          strokeDashArray: [5, 5],
          transparentCorners: false,
          cornerColor: 'white',
          cornerSize: 10,
          cornerStyle: 'circle',
          hasRotatingPoint: false,
          lockScalingFlip: true,
          name: 'cropRect'
        });
        
        canvas.add(rect);
        canvas.setActiveObject(rect);
        setCropRectRef(rect);
      } else {
        // Apply crop
        if (!cropRectRef) return;
        
        // Get the image
        const image = canvas.getObjects().find(obj => obj !== cropRectRef);
        if (!image) return;
        
        // Calculate crop area
        const cropRect = cropRectRef;
        const imgElem = image.getElement();
        
        if (!imgElem) {
          console.error("Image element not found");
          return;
        }
        
        // Create a temporary canvas for cropping
        const tempCanvas = document.createElement('canvas');
        const tCtx = tempCanvas.getContext('2d');
        
        // Convert all coordinates to absolute coordinates
        const imgLeft = image.left - image.getScaledWidth() / 2;
        const imgTop = image.top - image.getScaledHeight() / 2;
        
        const cropLeft = cropRect.left - cropRect.width / 2;
        const cropTop = cropRect.top - cropRect.height / 2;
        
        // Calculate the crop area relative to the image
        const cropX = (cropLeft - imgLeft) / image.scaleX;
        const cropY = (cropTop - imgTop) / image.scaleY;
        const cropWidth = cropRect.width / image.scaleX;
        const cropHeight = cropRect.height / image.scaleY;
        
        // Set the temp canvas dimensions to the crop size
        tempCanvas.width = cropWidth;
        tempCanvas.height = cropHeight;
        
        // Draw only the cropped portion to our temp canvas
        tCtx.drawImage(
          imgElem, 
          cropX, cropY, cropWidth, cropHeight,
          0, 0, cropWidth, cropHeight
        );
        
        // Convert the temp canvas to a data URL
        const croppedDataUrl = tempCanvas.toDataURL();
        
        // Remove both the original image and crop rectangle
        canvas.remove(image);
        canvas.remove(cropRect);
        
        // Load the cropped image
        fabric.Image.fromURL(croppedDataUrl, (croppedImg) => {
          // Scale to fit in the canvas view
          const canvasWidth = canvas.getWidth();
          const canvasHeight = canvas.getHeight();
          
          const imgWidth = croppedImg.width;
          const imgHeight = croppedImg.height;
          
          let scaleFactor = 1;
          if (imgWidth > imgHeight) {
            scaleFactor = (canvasWidth * 0.9) / imgWidth;
          } else {
            scaleFactor = (canvasHeight * 0.9) / imgHeight;
          }
          
          croppedImg.scale(scaleFactor);
          
          // Center the cropped image
          croppedImg.set({
            originX: 'center',
            originY: 'center',
            left: canvasWidth / 2,
            top: canvasHeight / 2
          });
          
          // Add to canvas and render
          canvas.add(croppedImg);
          applyFiltersAndBorders(croppedImg);
          canvas.requestRenderAll();
          
          // Add to history
          const historyItem = {
            url: croppedDataUrl,
            date: new Date().toLocaleString(),
            note: "Cropped image"
          };
          setUploadHistory(prev => [...prev, historyItem]);
          
          setCropRectRef(null);
          setIsCropping(false);
        });
      }
    } catch (err) {
      console.error("Error during crop:", err);
      setIsCropping(false);
      setCropRectRef(null);
    }
  };
  
  // Handle image rotation
  const handleRotate = (direction) => {
    if (!canvas) return;
    
    try {
      const angle = direction === 'clockwise' ? 90 : -90;
      const activeObj = canvas.getActiveObject();
      
      if (activeObj && activeObj.name !== 'cropRect') {
        const currentAngle = activeObj.angle || 0;
        activeObj.rotate(currentAngle + angle);
      } else {
        // If no object is selected, rotate the first image
        const objects = canvas.getObjects();
        const imgObj = objects.find(obj => obj.name !== 'cropRect');
        if (imgObj) {
          const currentAngle = imgObj.angle || 0;
          imgObj.rotate(currentAngle + angle);
        }
      }
      
      canvas.requestRenderAll();
    } catch (err) {
      console.error("Error rotating image:", err);
    }
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
    if (size === activeSize || !canvas) return;
    
    setIsLoading(true);
    setActiveSize(size);
    
    // Find and remove the current image
    const objects = canvas.getObjects();
    const currentImage = objects.find(obj => obj.name !== 'cropRect');
    
    if (currentImage) {
      canvas.remove(currentImage);
      
      // If we're in crop mode, exit it
      if (isCropping && cropRectRef) {
        canvas.remove(cropRectRef);
        setCropRectRef(null);
        setIsCropping(false);
      }
      
      // Use original image if available, otherwise use URL
      if (originalImage) {
        const clonedImage = fabric.util.object.clone(originalImage);
        
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        
        const imgWidth = clonedImage.width || 0;
        const imgHeight = clonedImage.height || 0;
        const imgAspect = imgWidth / imgHeight;
        const canvasAspect = canvasWidth / canvasHeight;
        
        let scaleFactor = 1;
        if (imgAspect > canvasAspect) {
          scaleFactor = canvasWidth / imgWidth;
        } else {
          scaleFactor = canvasHeight / imgHeight;
        }
        
        // Apply size adjustment
        const sizeAdjustment = IMAGE_SIZES[size].scale;
        scaleFactor = scaleFactor * sizeAdjustment;
        
        clonedImage.scale(scaleFactor * 0.9);
        
        // If we need a specific aspect ratio, apply it
        if (IMAGE_SIZES[size].aspectRatio) {
          const targetRatio = IMAGE_SIZES[size].aspectRatio;
          const currentRatio = clonedImage.width / clonedImage.height;
          
          // Only adjust if the ratio difference is significant
          if (Math.abs(currentRatio - targetRatio) > 0.05) {
            if (currentRatio > targetRatio) {
              // Too wide, need to reduce width or increase height
              const newWidth = clonedImage.height * targetRatio;
              clonedImage.scaleToWidth(newWidth * scaleFactor);
            } else {
              // Too tall, need to reduce height or increase width
              const newHeight = clonedImage.width / targetRatio;
              clonedImage.scaleToHeight(newHeight * scaleFactor);
            }
          }
        }
        
        clonedImage.set({
          originX: 'center',
          originY: 'center',
          left: canvasWidth / 2,
          top: canvasHeight / 2,
        });
        
        canvas.add(clonedImage);
        applyFiltersAndBorders(clonedImage);
        canvas.requestRenderAll();
        setIsLoading(false);
      } else {
        // Fallback to loading from URL if original image isn't available
        fabric.Image.fromURL(imageUrl, (fabricImg) => {
          if (!canvas || !fabricImg) return;
          
          const canvasWidth = canvas.getWidth();
          const canvasHeight = canvas.getHeight();
          
          const imgWidth = fabricImg.width || 0;
          const imgHeight = fabricImg.height || 0;
          const imgAspect = imgWidth / imgHeight;
          const canvasAspect = canvasWidth / canvasHeight;
          
          let scaleFactor = 1;
          if (imgAspect > canvasAspect) {
            scaleFactor = canvasWidth / imgWidth;
          } else {
            scaleFactor = canvasHeight / imgHeight;
          }
          
          // Apply size adjustment
          const sizeAdjustment = IMAGE_SIZES[size].scale;
          scaleFactor = scaleFactor * sizeAdjustment;
          
          fabricImg.scale(scaleFactor * 0.9);
          
          // Apply aspect ratio if needed
          if (IMAGE_SIZES[size].aspectRatio) {
            const targetRatio = IMAGE_SIZES[size].aspectRatio;
            const currentRatio = fabricImg.width / fabricImg.height;
            
            if (Math.abs(currentRatio - targetRatio) > 0.05) {
              if (currentRatio > targetRatio) {
                const newWidth = fabricImg.height * targetRatio;
                fabricImg.scaleToWidth(newWidth * scaleFactor);
              } else {
                const newHeight = fabricImg.width / targetRatio;
                fabricImg.scaleToHeight(newHeight * scaleFactor);
              }
            }
          }
          
          fabricImg.set({
            originX: 'center',
            originY: 'center',
            left: canvasWidth / 2,
            top: canvasHeight / 2,
          });
          
          canvas.add(fabricImg);
          applyFiltersAndBorders(fabricImg);
          canvas.requestRenderAll();
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
      console.error("Error saving image:", error);
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
        <canvas ref={canvasRef} className="w-full h-full" />
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
              <span>{isMobile ? '' : (isCropping ? 'Apply Crop' : 'Crop')}</span>
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
                value={[adjustmentValues[activeAdjustment]]}
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
                  type="button"
                >
                  {sampleImages[filter] ? (
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
                  type="button"
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
            <h4 className="text-sm font-medium text-gray-700 mb-2">Edit History</h4>
            {uploadHistory.length === 0 ? (
              <p className="text-xs text-gray-500">No history yet</p>
            ) : (
              <div className="max-h-32 overflow-y-auto text-xs">
                {uploadHistory.map((item, index) => (
                  <div key={index} className="flex justify-between py-1 border-b border-gray-100 last:border-b-0">
                    <span className="text-gray-600">
                      {item.note || `Image ${index + 1}`} {item.size ? `(${item.size})` : ''}
                    </span>
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
