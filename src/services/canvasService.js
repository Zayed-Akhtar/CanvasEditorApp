export async function loadCanvasFromJSON(canvas, json) {
  if (!json) return;
  await canvas.loadFromJSON(json);
  canvas.renderAll();
}

export const exportCanvasAsPNG = (canvas, fileName = 'canvas-export.png')=>{
    if (!canvas) return;

  // Get the canvas contents as a data URL (PNG)
  const dataURL = canvas.toDataURL({
    format: 'png',
    quality: 1.0,
  });

  // Create a temporary link to trigger download
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const applyViewOnlyRestrictions = (canvas) => {
    canvas.selection = false;
    canvas.forEachObject(obj => {
      obj.selectable = false;
      obj.evented = false;
      obj.lockMovementX = true;
      obj.lockMovementY = true;
      obj.lockScalingX = true;
      obj.lockScalingY = true;
      obj.lockRotation = true;
    });
    canvas.discardActiveObject();
    canvas.renderAll();
}

   
export const handleLockObject = (canvas) => {
    const obj = canvas.getActiveObject();
    if (obj) {
        obj.lockMovementX = true;
        obj.lockMovementY = true;
        obj.lockScalingX = true;
        obj.lockScalingY = true;
        obj.lockRotation = true;
        obj.selectable = false;
        obj.evented = false;
        canvas.discardActiveObject();
        canvas.renderAll();
    }
};

export const handleUnlockObject = (canvas) => {
    canvas.forEachObject(obj => {
      obj.lockMovementX = false;
      obj.lockMovementY = false;
      obj.lockScalingX = false;
      obj.lockScalingY = false;
      obj.lockRotation = false;
      obj.selectable = true;
      obj.evented = true;
    });
    canvas.renderAll();
};
