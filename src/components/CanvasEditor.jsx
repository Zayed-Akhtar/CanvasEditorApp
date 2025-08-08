import React, { useEffect, useRef, useCallback } from "react";
import * as fabric from "fabric";
import { db } from "../firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import debounce from "lodash.debounce";
import Toolbar from "./Toolbar";
import Header from "./Header";

// Utility: loads from JSON and renders
async function loadCanvasFromJSON(canvas, json) {
  if (!json) return;
  await canvas.loadFromJSON(json);
  canvas.renderAll();
}

function CanvasEditor({ sceneId }) {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const [isPenActive, setIsPenActive] = React.useState(false);
  const [undoStack, setUndoStack] = React.useState([]);
  const [redoStack, setRedoStack] = React.useState([]);

  // Save canvas state to undo stack and clear redo stack
  const saveHistory = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const json = JSON.stringify(canvas.toJSON());
    setUndoStack(prev => (prev[prev.length - 1] === json ? prev : [...prev, json]));
  }, []);

  // Load scene from Firestore
  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, { width: 1130, height: 590, backgroundColor: "#fff" });
    fabricRef.current = canvas;

    const docRef = doc(db, "scenes", sceneId);

    async function fetchAndLoad() {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().canvas) {
        await loadCanvasFromJSON(canvas, docSnap.data().canvas);
      }
      // Initialize undo stack after first load
      setUndoStack([JSON.stringify(canvas.toJSON())]);
      setRedoStack([]);
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

    // User-driven edits (move, resize, pen, remove object etc.)
    const onModified = () => saveHistory();
    fabricRef.current.on("object:modified", onModified);
    fabricRef.current.on("object:removed", onModified);
    fabricRef.current.on("path:created", onModified);

    fabricRef.current.on("object:added", saveDebounced);
    fabricRef.current.on("object:modified", saveDebounced);
    fabricRef.current.on("object:removed", saveDebounced);

    // Cleanup
    return () => {
      saveDebounced.cancel();
      fabricRef.current.off("object:modified", onModified);
      fabricRef.current.off("object:removed", onModified);
      fabricRef.current.off("path:created", onModified);
    };
  }, [sceneId, saveHistory]);

  // Toolbar actions – call saveHistory() just BEFORE any programmatic change
  const addRect = () => {
    saveHistory();
    const canvas = fabricRef.current;
    canvas.add(new fabric.Rect({ left: 100, top: 100, width: 80, height: 50, fill: "blue" }));
  };
  const addCircle = () => {
    saveHistory();
    const canvas = fabricRef.current;
    canvas.add(new fabric.Circle({ left: 150, top: 150, radius: 40, fill: "green" }));
  };
  const addText = () => {
    saveHistory();
    const canvas = fabricRef.current;
    canvas.add(new fabric.Textbox("Edit me", { left: 200, top: 200, fontSize: 24 }));
  };

  const togglePen = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const newPenState = !canvas.isDrawingMode;
    canvas.isDrawingMode = newPenState;
    if (newPenState) {
      if (!canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      }
      canvas.freeDrawingBrush.color = "black";
      canvas.freeDrawingBrush.width = 3;
      canvas.selection = false;
    } else {
      canvas.selection = true;
    }
    setIsPenActive(newPenState);
  };

  const handleDelete = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    saveHistory();
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  const handleColorChange = (color) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;
    saveHistory();
    // For Rect, Circle, etc.
    if (activeObject.set && activeObject.fill !== undefined) {
      activeObject.set("fill", color);
      canvas.renderAll();
      canvas.fire("object:modified"); // To trigger autosave
    }
    if (activeObject.set && activeObject.text) {
      activeObject.set("fill", color);
      canvas.renderAll();
      canvas.fire("object:modified");
    }
  };

  const handleUndo = async () => {
    if (undoStack.length <= 1) return; // Don't undo beyond initial state
    const canvas = fabricRef.current;
    const newUndoStack = [...undoStack];
    const prevState = newUndoStack[newUndoStack.length - 2];
    setUndoStack(newUndoStack.slice(0, -1));
    setRedoStack(r => [...r, JSON.stringify(canvas.toJSON())]);
    await canvas.loadFromJSON(prevState);
    canvas.renderAll();
  };

  const handleRedo = async () => {
    if (redoStack.length === 0) return;
    const canvas = fabricRef.current;
    const nextState = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, nextState]);
    await canvas.loadFromJSON(nextState);
    canvas.renderAll();
  };

  const handleExport = () => {
  const canvas = fabricRef.current;
  if (!canvas) return;

  // Get the canvas contents as a data URL (PNG)
  const dataURL = canvas.toDataURL({
    format: 'png',
    quality: 1.0,
  });

  // Create a temporary link to trigger download
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = 'canvas-export.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


  return (
    <>
      <Header />
      <div className="canva-box">
        <Toolbar
          addRect={addRect}
          addText={addText}
          addCircle={addCircle}
          togglePen={togglePen}
          handleShare={handleShare}
          handleDelete={handleDelete}
          handleColorChange={handleColorChange}
          handleUndo={handleUndo}
          handleRedo={handleRedo}
          handleExport={handleExport}
          enableUndo={undoStack.length}
          enableRedo={redoStack.length} 
          isPenActive={isPenActive}
        />
        <canvas ref={canvasRef} width={1130} height={590} style={{ border: "1px solid #ccc", marginTop: 10 }} />
      </div>
    </>
  );
}

export default CanvasEditor;
