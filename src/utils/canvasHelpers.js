// utils/canvasHelpers.js
export const downloadCanvasImage = (canvas, filename = 'design.png') => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
};

export const exportDesignData = (designData) => {
  const dataStr = JSON.stringify(designData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.download = 'design.json';
  link.href = URL.createObjectURL(dataBlob);
  link.click();
};

export const importDesignData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const designData = JSON.parse(e.target.result);
        resolve(designData);
      } catch (error) {
        reject(new Error('Invalid design file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};