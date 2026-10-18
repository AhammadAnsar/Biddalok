/**
 * Image compression and validation utility to prevent LocalStorage/IndexedDB QuotaExceededError
 * and properly preserve PNG transparency without turning backgrounds black.
 */

export async function compressImageBase64(
  file: File, 
  maxWidth: number = 400, 
  maxHeight: number = 400, 
  quality: number = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If file is SVG, read directly as data URL to preserve vector fidelity
    if (file.type.includes('svg')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const isPng = file.type.includes('png') || file.name.toLowerCase().endsWith('.png');
    const isWebp = file.type.includes('webp') || file.name.toLowerCase().endsWith('.webp');

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

        // If already a PNG and within dimensions/reasonable size, return original to preserve 100% vector/pixel transparency
        if (isPng && img.width <= maxWidth && img.height <= maxHeight && file.size < 2.5 * 1024 * 1024) {
          resolve(img.src);
          return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) {
          resolve(img.src);
          return;
        }

        // Clear canvas to ensure transparent background is preserved
        ctx.clearRect(0, 0, width, height);

        // If not a transparent format (e.g. JPEG), fill with white background to prevent any black artifact
        if (!isPng && !isWebp) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Preserve PNG format so transparency is not converted to black
        let outputType = 'image/jpeg';
        if (isPng) {
          outputType = 'image/png';
        } else if (isWebp) {
          outputType = 'image/webp';
        }

        const compressed = isPng 
          ? canvas.toDataURL('image/png') 
          : canvas.toDataURL(outputType, quality);

        resolve(compressed);
      };
      img.onerror = () => resolve(event.target?.result as string);
    };
    reader.onerror = reject;
  });
}

