/**
 * Image compression and validation utility to prevent LocalStorage/IndexedDB QuotaExceededError
 */

export async function compressImageBase64(
  file: File, 
  maxWidth: number = 300, 
  maxHeight: number = 300, 
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If file is SVG, read directly as data URL or text to preserve vector fidelity
    if (file.type.includes('svg')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(img.src);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Output compressed webp or jpeg
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = () => resolve(event.target?.result as string);
    };
    reader.onerror = reject;
  });
}
