import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { loadImage, dataURLtoFile } from './utils';

export function FormatConversion({ file }: { file: File }) {
  const [format, setFormat] = useState<string>('png');
  const [convertedFile, setConvertedFile] = useState<File | null>(null);

  const handleConvert = async () => {
    try {
      const img = await loadImage(file);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      
      const dataURL = canvas.toDataURL(`image/${format}`);
      const newFile = dataURLtoFile(dataURL, `converted.${format}`);
      setConvertedFile(newFile);
    } catch (error) {
      console.error('Conversion failed:', error);
    }
  };

  return (
    <div className="space-y-4">
      <Select onValueChange={setFormat} defaultValue={format}>
        <SelectTrigger>
          <SelectValue placeholder="Select format" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="png">PNG</SelectItem>
          <SelectItem value="jpeg">JPEG</SelectItem>
          <SelectItem value="webp">WebP</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={handleConvert}>Convert</Button>
      {convertedFile && (
        <div>
          <p>Converted file: {convertedFile.name}</p>
          <a
            href={URL.createObjectURL(convertedFile)}
            download={convertedFile.name}
            className="text-blue-500 underline"
          >
            Download converted file
          </a>
        </div>
      )}
    </div>
  );
}