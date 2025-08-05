import React, { useEffect, useRef } from "react";
import * as fabric from "fabric";
import { db } from "../firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import debounce from "lodash.debounce";

function loadCanvasFromJSON(canvas, json) {
  canvas.loadFromJSON(json, () => canvas.renderAll());
}

function CanvasEditor({ sceneId }) {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);

  // Load scene from Firestore
  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, { width: 800, height: 600, backgroundColor: "#fff" });
    fabricRef.current = canvas;

    // Load canvas state from Firestore
    const docRef = doc(db, "scenes", sceneId);
    getDoc(docRef).then((docSnap) => {
      if (docSnap.exists()) {
        loadCanvasFromJSON(canvas, docSnap.data().canvas || null);
      }
    });

    // Live update listener
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const current = JSON.stringify(canvas.toJSON());
        if (docSnap.data().canvas !== current) {
          loadCanvasFromJSON(canvas, docSnap.data().canvas);
        }
      }
    });

    // Cleanup
    return () => {
      unsub();
      canvas.dispose();
    };
  }, [sceneId]);

  // Auto-save canvas changes to Firestore (debounced)
  useEffect(() => {
    const saveDebounced = debounce(() => {
      const canvas = fabricRef.current;
      const docRef = doc(db, "scenes", sceneId);
      setDoc(docRef, { canvas: JSON.stringify(canvas.toJSON()) });
    }, 800);

    if (!fabricRef.current) return;

    fabricRef.current.on("object:added", saveDebounced);
    fabricRef.current.on("object:modified", saveDebounced);
    fabricRef.current.on("object:removed", saveDebounced);

    return () => saveDebounced.cancel();
  }, [sceneId]);

  // Toolbar actions
  const addRect = () => {
    const canvas = fabricRef.current;
    canvas.add(new fabric.Rect({ left: 100, top: 100, width: 80, height: 50, fill: "blue" }));
  };
  const addCircle = () => {
    const canvas = fabricRef.current;
    canvas.add(new fabric.Circle({ left: 150, top: 150, radius: 40, fill: "green" }));
  };
  const addText = () => {
    const canvas = fabricRef.current;
    canvas.add(new fabric.Textbox("Edit me", { left: 200, top: 200, fontSize: 24 }));
  };
  const addPen = () => {
    const canvas = fabricRef.current;
    canvas.isDrawingMode = !canvas.isDrawingMode;
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  return (
    <div>
      <div>
        <button onClick={addRect}>Rectangle</button>
        <button onClick={addCircle}>Circle</button>
        <button onClick={addText}>Text</button>
        <button onClick={addPen}>Pen Tool</button>
        <button onClick={handleShare}>Share Canvas</button>
      </div>
      <canvas ref={canvasRef} width={800} height={600} style={{ border: "1px solid #ccc", marginTop: 10 }} />
    </div>
  );
}

export default CanvasEditor;
