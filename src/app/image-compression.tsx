import React, { useState, useEffect, useCallback } from 'react';
import { Slider } from "@/components/ui/slider";
import { loadImage, resizeImage, dataURLtoFile } from './utils';

export function ImageCompression({ file }: { file: File }) {
  const [quality, setQuality] = useState<number>(80);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [compressedPreview, setCompressedPreview] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [originalExtension, setOriginalExtension] = useState<string>('');

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setOriginalPreview(dataUrl);
      const img = await loadImage(file);
      setOriginalImage(img);
      setOriginalExtension(file.name.split('.').pop() || '');
    };
    reader.readAsDataURL(file);
  }, [file]);

  const compressImage = useCallback(async (quality: number) => {
    if (!originalImage) return;

    // 元の画像のアスペクト比を維持しつつ、必要な場合のみリサイズ
    const canvas = resizeImage(originalImage, originalImage.width, originalImage.height);
    
    // JPEG形式で圧縮
    const dataURL = canvas.toDataURL('image/jpeg', quality / 100);
    const newFile = dataURLtoFile(dataURL, 'compressed.jpg');
    setCompressedFile(newFile);
    setCompressedPreview(dataURL);
  }, [originalImage]);

  useEffect(() => {
    compressImage(quality);
  }, [quality, compressImage]);

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
      <div className="flex space-x-4">
        <div>
          <h3 className="text-lg font-semibold">Original ({originalExtension.toUpperCase()})</h3>
          {originalPreview && (
            <img src={originalPreview} alt="Original" className="max-w-xs max-h-64 object-contain" />
          )}
          <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Compressed (JPEG)</h3>
          {compressedPreview && (
            <img src={compressedPreview} alt="Compressed" className="max-w-xs max-h-64 object-contain" />
          )}
          {compressedFile && (
            <>
              <p>Size: {(compressedFile.size / 1024).toFixed(2)} KB</p>
              <a
                href={URL.createObjectURL(compressedFile)}
                download={compressedFile.name}
                className="text-blue-500 underline"
              >
                Download compressed file (JPEG)
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}