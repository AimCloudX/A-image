import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loadImage, dataURLtoFile } from './utils';

export function Watermark({ file }: { file: File }) {
  const [text, setText] = useState<string>('');
  const [watermarkedFile, setWatermarkedFile] = useState<File | null>(null);

  const handleAddWatermark = async () => {
    try {
      const img = await loadImage(file);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Add watermark
      ctx.font = '48px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      
      const dataURL = canvas.toDataURL('image/png');
      const newFile = dataURLtoFile(dataURL, 'watermarked.png');
      setWatermarkedFile(newFile);
    } catch (error) {
      console.error('Watermarking failed:', error);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Watermark text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Button onClick={handleAddWatermark}>Add Watermark</Button>
      {watermarkedFile && (
        <div>
          <p>Watermarked file: {watermarkedFile.name}</p>
          <a
            href={URL.createObjectURL(watermarkedFile)}
            download={watermarkedFile.name}
            className="text-blue-500 underline"
          >
            Download watermarked file
          </a>
        </div>
      )}
    </div>
  );
}