import React, { useEffect, useRef } from 'react';
import * as fabric from "fabric";


export default function CanvaBoard({width, height, onInit}) {
    var canvasRef = useRef(null);
  useEffect(()=>{
        const canvas = new fabric.Canvas(canvasRef.current, { width, height, backgroundColor: "#fff" });
        
        if (onInit) onInit(canvas);  // Notify parent with fabric instance if needed   
        return () => {
      canvas.dispose();
    };
  }, [width, height, onInit])
    return (
        <canvas ref={canvasRef} width={width} height={height} style={{ border: "1px solid #ccc", marginTop: 10 }} />
  )
}
