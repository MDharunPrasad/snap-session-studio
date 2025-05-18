
import React, { useState, useRef, useEffect } from 'react';
import { Canvas as FabricCanvas, Image as FabricImage, filters } from 'fabric';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Crop,
  RotateCcw,
  RotateCw,
  Contrast,
  SunMedium, // Using SunMedium instead of Brightness
  Loader,
} from "lucide-react";

interface PhotoEditorProps {
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
  onCancel: () => void;
}

const PhotoEditor: React.FC<PhotoEditorProps> = ({ imageUrl, onSave, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<FabricCanvas | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAdjustment, setActiveAdjustment] = useState<string | null>(null);
  const [adjustmentValues, setAdjustmentValues] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
  });
  
  // Initialize the canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const fabricCanvas = new FabricCanvas(canvasRef.current, {
      width: 600,
      height: 450,
      backgroundColor: '#f3f3f3',
    });
    
    setCanvas(fabricCanvas);
    
    return () => {
      fabricCanvas.dispose();
    };
  }, []);
  
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
      const canvasAspect = canvas.width! / canvas.height!;
      
      let scaleFactor = 1;
      if (imgAspect > canvasAspect) {
        scaleFactor = canvas.width! / img.width;
      } else {
        scaleFactor = canvas.height! / img.height;
      }
      
      // Create a fabric image and add it to the canvas
      FabricImage.fromURL(imageUrl, (fabricImg) => {
        fabricImg.scale(scaleFactor * 0.9);
        
        // Center the image on the canvas
        fabricImg.set({
          originX: 'center',
          originY: 'center',
          left: canvas.width! / 2,
          top: canvas.height! / 2,
        });
        
        canvas.clear();
        canvas.add(fabricImg);
        canvas.renderAll();
        setIsLoading(false);
      });
    };
    
    img.onerror = () => {
      console.error("Error loading image");
      setIsLoading(false);
    };
  }, [canvas, imageUrl]);
  
  // Handle image crop
  const handleCrop = () => {
    if (!canvas) return;
    
    // In a real implementation, this would use fabric.js crop functionality
    console.log("Crop functionality would be implemented here");
    // For now, just toggle the active adjustment
    setActiveAdjustment(activeAdjustment === 'crop' ? null : 'crop');
  };
  
  // Handle image rotation
  const handleRotate = (direction: 'clockwise' | 'counterclockwise') => {
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
  const handleAdjustmentChange = (value: number[]) => {
    if (!activeAdjustment || !canvas) return;
    
    const newValues = { ...adjustmentValues };
    newValues[activeAdjustment as keyof typeof adjustmentValues] = value[0];
    setAdjustmentValues(newValues);
    
    // Apply the filter to the image
    const objects = canvas.getObjects();
    if (objects.length > 0) {
      const img = objects[0] as any; // Using 'any' to avoid TypeScript errors for now
      
      // Clear existing filters
      img.filters = [];
      
      // Apply brightness filter
      if (newValues.brightness !== 0) {
        img.filters.push(new filters.Brightness({
          brightness: newValues.brightness / 100
        }));
      }
      
      // Apply contrast filter
      if (newValues.contrast !== 0) {
        img.filters.push(new filters.Contrast({
          contrast: newValues.contrast / 100
        }));
      }
      
      // Apply saturation filter
      if (newValues.saturation !== 0) {
        img.filters.push(new filters.Saturation({
          saturation: newValues.saturation / 100
        }));
      }
      
      img.applyFilters();
      canvas.renderAll();
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
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
            <Loader className="animate-spin text-photobooth-primary" />
          </div>
        )}
        <canvas ref={canvasRef} className="w-full" />
      </div>
      
      <div className="mb-4">
        <div className="flex flex-wrap gap-2 mb-3">
          <Button 
            variant={activeAdjustment === 'crop' ? 'default' : 'outline'} 
            onClick={handleCrop}
            className="flex items-center gap-1"
          >
            <Crop className="w-4 h-4" />
            <span>Crop</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => handleRotate('counterclockwise')}
            className="flex items-center gap-1"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Rotate Left</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => handleRotate('clockwise')}
            className="flex items-center gap-1"
          >
            <RotateCw className="w-4 h-4" />
            <span>Rotate Right</span>
          </Button>
          
          <Button 
            variant={activeAdjustment === 'brightness' ? 'default' : 'outline'} 
            onClick={() => setActiveAdjustment(activeAdjustment === 'brightness' ? null : 'brightness')}
            className="flex items-center gap-1"
          >
            <SunMedium className="w-4 h-4" />
            <span>Brightness</span>
          </Button>
          
          <Button 
            variant={activeAdjustment === 'contrast' ? 'default' : 'outline'} 
            onClick={() => setActiveAdjustment(activeAdjustment === 'contrast' ? null : 'contrast')}
            className="flex items-center gap-1"
          >
            <Contrast className="w-4 h-4" />
            <span>Contrast</span>
          </Button>
          
          <Button 
            variant={activeAdjustment === 'saturation' ? 'default' : 'outline'} 
            onClick={() => setActiveAdjustment(activeAdjustment === 'saturation' ? null : 'saturation')}
            className="flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v5" />
              <path d="M19 6l-3 5" />
              <path d="M19 18l-3-5" />
              <path d="M12 22v-5" />
              <path d="M5 18l3-5" />
              <path d="M5 6l3 5" />
            </svg>
            <span>Saturation</span>
          </Button>
        </div>
        
        {activeAdjustment && (
          <div className="py-2">
            <label className="block text-sm font-medium mb-1 capitalize">
              {activeAdjustment} ({adjustmentValues[activeAdjustment as keyof typeof adjustmentValues]})
            </label>
            <Slider
              defaultValue={[adjustmentValues[activeAdjustment as keyof typeof adjustmentValues]]}
              min={-100}
              max={100}
              step={1}
              onValueChange={handleAdjustmentChange}
              className="w-full"
            />
          </div>
        )}
      </div>
      
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
