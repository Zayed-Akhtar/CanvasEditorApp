import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

// Load the canvas JSON string from Firestore
export const fetchCanvasJSON = async(db, sceneId)=>{
    const docRef = doc(db, "scenes", sceneId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() && docSnap.data().canvas ? docSnap.data().canvas : null;
}

// Save the canvas JSON string to Firestore
export const saveCanvasJSON = async(db, sceneId, canvas)=>{
    const docRef = doc(db, "scenes", sceneId);
  return setDoc(docRef, { canvas: JSON.stringify(canvas.toJSON()) });
}

// Listen for scene changes and trigger a callback
export const subscribeToCanvasScene = (db, sceneId, callback)=> {
  const docRef = doc(db, "scenes", sceneId);
  return onSnapshot(docRef, callback);
}