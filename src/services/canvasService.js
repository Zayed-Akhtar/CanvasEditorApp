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