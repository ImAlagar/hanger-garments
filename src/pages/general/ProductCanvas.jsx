import React, { useEffect, useRef } from 'react';
import { Canvas, Image as FabricImage } from 'fabric';

const ProductCanvas = ({ imageUrl }) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);

  useEffect(() => {
    // Initialize Fabric Canvas
    fabricCanvasRef.current = new Canvas(canvasRef.current, {
      width: 400,
      height: 500,
      backgroundColor: '#fff',
    });

    // Load T-shirt / product image
    if (imageUrl) {
      FabricImage.fromURL(imageUrl, (img) => {
        img.set({ selectable: false });
        fabricCanvasRef.current.setBackgroundImage(
          img,
          fabricCanvasRef.current.renderAll.bind(fabricCanvasRef.current),
          {
            scaleX: 400 / img.width,
            scaleY: 500 / img.height,
          }
        );
      });
    }

    // Cleanup on unmount
    return () => {
      fabricCanvasRef.current.dispose();
    };
  }, [imageUrl]);

  return <canvas ref={canvasRef} className="border rounded-lg w-full h-[500px]" />;
};

export default ProductCanvas;
