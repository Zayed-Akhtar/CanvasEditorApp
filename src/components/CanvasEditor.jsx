import React, { useEffect, useRef } from "react";
import * as fabric from "fabric";
import { db } from "../firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import debounce from "lodash.debounce";
import Toolbar from "./Toolbar";
import Header from "./Header";

async function loadCanvasFromJSON(canvas, json) {
  if (!json) return;
  await canvas.loadFromJSON(json);
  canvas.renderAll();
}

function CanvasEditor({ sceneId }) {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const [isPenActive, setIsPenActive] = React.useState(false);

  // Load scene from Firestore
useEffect(() => {
  const canvas = new fabric.Canvas(canvasRef.current, { width: 800, height: 600, backgroundColor: "#fff" });
  fabricRef.current = canvas;

  const docRef = doc(db, "scenes", sceneId);
  
  // Async fetch and loader for first mount
  async function fetchAndLoad() {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().canvas) {
      await loadCanvasFromJSON(canvas, docSnap.data().canvas);
    }
  }
  fetchAndLoad();

  // Real-time Firestore listener
  const unsub = onSnapshot(docRef, async (docSnap) => {
    if (docSnap.exists() && docSnap.data().canvas) {
      const current = JSON.stringify(canvas.toJSON());
      if (docSnap.data().canvas !== current) {
        await loadCanvasFromJSON(canvas, docSnap.data().canvas);
      }
    }
  });

  // Cleanup routine
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
  
const togglePen = () => {
  const canvas = fabricRef.current;
  if (!canvas) return;

  // Toggle drawing mode
  const newPenState = !canvas.isDrawingMode;
  canvas.isDrawingMode = newPenState;

  if (newPenState) {
    // Make sure freeDrawingBrush exists and is initialized
    if (!canvas.freeDrawingBrush) {
      // PencilBrush is default in most Fabric.js releases; adjust if needed
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    }
    canvas.freeDrawingBrush.color = "black"; // Set pen color
    canvas.freeDrawingBrush.width = 3;       // Set pen thickness
    canvas.selection = false;                // Prevent shape selection while drawing
  } else {
    canvas.selection = true; // Restore selection capability
  }
  setIsPenActive(newPenState);
};

  const handleDelete = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  return (
    <>
    <Header/>
    <div className="canva-box">
     <Toolbar addRect={addRect} addText={addText} addCircle={addCircle} togglePen={togglePen} handleShare={handleShare} handleDelete={handleDelete} isPenActive={isPenActive}/>
      <canvas ref={canvasRef} width={900} height={800} style={{ border: "1px solid #ccc", marginTop: 10}} />
    </div>
    </>

  );
}

export default CanvasEditor;
