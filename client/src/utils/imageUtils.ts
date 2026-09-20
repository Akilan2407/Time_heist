/**
 * Utility to dynamically remove white background from sprites using HTML5 Canvas.
 */
const transparentCache = new Map<string, string>();

export function removeWhiteBackground(imageSrc: string): Promise<string> {
  if (transparentCache.has(imageSrc)) {
    return Promise.resolve(transparentCache.get(imageSrc)!);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(imageSrc);
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Scan all pixels: if pixel is white/near-white, set alpha to 0 with edge softening
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Strict white / light gray threshold
        const brightness = (r + g + b) / 3;
        const colorSpread = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));

        // If high brightness and low saturation (white/off-white background)
        if (brightness > 230 && colorSpread < 20) {
          data[i + 3] = 0; // 100% Transparent
        } else if (brightness > 200 && colorSpread < 25) {
          // Soft blend edge anti-aliasing
          const alphaFactor = Math.max(0, (230 - brightness) / 30);
          data[i + 3] = Math.round(data[i + 3] * alphaFactor);
        }
      }

      ctx.putImageData(imgData, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      transparentCache.set(imageSrc, dataUrl);
      resolve(dataUrl);
    };

    img.onerror = () => {
      resolve(imageSrc);
    };
  });
}
