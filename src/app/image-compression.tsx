import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { loadImage, resizeImage, dataURLtoFile } from './utils';

export function ImageCompression({ file }: { file: File }) {
  const [quality, setQuality] = useState<number>(80);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);

  const handleCompress = async () => {
    try {
      const img = await loadImage(file);
      const canvas = resizeImage(img, 1920, 1080); // Max dimensions
      
      const dataURL = canvas.toDataURL('image/jpeg', quality / 100);
      const newFile = dataURLtoFile(dataURL, 'compressed.jpg');
      setCompressedFile(newFile);
    } catch (error) {
      console.error('Compression failed:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Quality: {quality}%</label>
        <Slider
          value={[quality]}
          onValueChange={(value) => setQuality(value[0])}
          min={1}
          max={100}
          step={1}
        />
      </div>
      <Button onClick={handleCompress}>Compress</Button>
      {compressedFile && (
        <div>
          <p>Compressed file size: {(compressedFile.size / 1024).toFixed(2)} KB</p>
          <a
            href={URL.createObjectURL(compressedFile)}
            download={compressedFile.name}
            className="text-blue-500 underline"
          >
            Download compressed file
          </a>
        </div>
      )}
    </div>
  );
}