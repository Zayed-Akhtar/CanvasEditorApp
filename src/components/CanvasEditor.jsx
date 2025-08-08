import React, { useEffect, useRef, useCallback } from "react";
import * as fabric from "fabric";
import { db } from "../firebase";
import { loadCanvasFromJSON, exportCanvasAsPNG } from "../services/canvasService";
import { fetchCanvasJSON, saveCanvasJSON, subscribeToCanvasScene } from "../services/firestoreService";
import debounce from "lodash.debounce";
import Toolbar from "./Toolbar";
import Header from "./Header";
import CanvaBoard from "./CanvaBoard";

function CanvasEditor({ sceneId }) {
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

  // Receive Fabric canvas from child component
  const handleCanvasInit = useCallback((canvasInstance) => {
    fabricRef.current = canvasInstance;
  }, []);

  // Load scene from Firestore (always use fabricRef.current)
  useEffect(() => {
    // Wait until fabricRef.current is set (by CanvaBoard)
    if (!fabricRef.current) return;

    fetchCanvasJSON(db, sceneId).then(async (json) => {
      if (json) await loadCanvasFromJSON(fabricRef.current, json);
      setUndoStack([JSON.stringify(fabricRef.current.toJSON())]);
      setRedoStack([]);
    });

    // Real-time Firestore listener
    const unsub = subscribeToCanvasScene(db, sceneId, async (docSnap) => {
      if (
        docSnap.exists() &&
        docSnap.data().canvas &&
        fabricRef.current // Canvas ready?
      ) {
        const current = JSON.stringify(fabricRef.current.toJSON());
        if (docSnap.data().canvas !== current) {
          await loadCanvasFromJSON(fabricRef.current, docSnap.data().canvas);
        }
      }
    });

    // Cleanup
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [sceneId, fabricRef.current]); // Add fabricRef.current to deps so it runs after canvas created

  // Auto-save canvas changes to Firestore (debounced)
  useEffect(() => {
    if (!fabricRef.current) return;

    const saveDebounced = debounce(() => {
      saveCanvasJSON(db, sceneId, fabricRef.current);
    }, 800);

    // User-driven edits (move, resize, pen, remove)
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
  }, [sceneId, saveHistory, fabricRef.current]); // Add fabricRef.current to deps

  // Toolbar actions – call saveHistory() just BEFORE any programmatic change
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
    if (activeObject.set && activeObject.fill !== undefined) {
      activeObject.set("fill", color);
      canvas.renderAll();
      canvas.fire("object:modified");
    }
    if (activeObject.set && activeObject.text) {
      activeObject.set("fill", color);
      canvas.renderAll();
      canvas.fire("object:modified");
    }
  };

  const handleUndo = async () => {
    if (undoStack.length <= 1) return;
    const canvas = fabricRef.current;
    const newUndoStack = [...undoStack];
    const prevState = newUndoStack[newUndoStack.length - 2];
    setUndoStack(newUndoStack.slice(0, -1));
    setRedoStack((r) => [...r, JSON.stringify(canvas.toJSON())]);
    await canvas.loadFromJSON(prevState);
    canvas.renderAll();
  };

  const handleRedo = async () => {
    if (redoStack.length === 0) return;
    const canvas = fabricRef.current;
    const nextState = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, nextState]);
    await canvas.loadFromJSON(nextState);
    canvas.renderAll();
  };

  const handleExport = () => {
    exportCanvasAsPNG(fabricRef.current);
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
        <CanvaBoard width={1130} height={590} onInit={handleCanvasInit} />
      </div>
    </>
  );
}

export default CanvasEditor;
