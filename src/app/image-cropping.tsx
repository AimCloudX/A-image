"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { loadImage, dataURLtoFile } from './utils';

export function ImageCropping({ file }: { file: File }) {
  const [image, setImage] = useState<string | null>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [endPos, setEndPos] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const loadAndDisplayImage = async () => {
      try {
        const img = await loadImage(file);
        setImage(img.src);
      } catch (error) {
        console.error('Failed to load image:', error);
      }
    };
    loadAndDisplayImage();
  }, [file]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    setStartPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    setEndPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    drawCropArea();
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const drawCropArea = () => {
    // const canvas = canvasRef.current!;
    // const ctx = canvas.getContext('2d')!;
    const img = new Image();
    img.src = image!;
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    // ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    // ctx.strokeStyle = 'red';
    // ctx.lineWidth = 2;
    // ctx.strokeRect(
    //   startPos.x,
    //   startPos.y,
    //   endPos.x - startPos.x,
    //   endPos.y - startPos.y
    // );
  };

  const handleCrop = () => {
    const canvas = canvasRef.current!;
    // const ctx = canvas.getContext('2d')!;
    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d')!;

    const width = Math.abs(endPos.x - startPos.x);
    const height = Math.abs(endPos.y - startPos.y);
    croppedCanvas.width = width;
    croppedCanvas.height = height;

    croppedCtx.drawImage(
      canvas,
      Math.min(startPos.x, endPos.x),
      Math.min(startPos.y, endPos.y),
      width,
      height,
      0,
      0,
      width,
      height
    );

    const dataURL = croppedCanvas.toDataURL('image/png');
    const newFile = dataURLtoFile(dataURL, 'cropped.png');
    setCroppedFile(newFile);
  };

  return (
    <div className="space-y-4">
      {image && (
        <canvas
          ref={canvasRef}
          width={500}
          height={500}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ border: '1px solid #ccc' }}
        />
      )}
      <Button onClick={handleCrop}>Crop</Button>
      {croppedFile && (
        <div>
          <p>Cropped file: {croppedFile.name}</p>
          <a
            href={URL.createObjectURL(croppedFile)}
            download={croppedFile.name}
            className="text-blue-500 underline"
          >
            Download cropped file
          </a>
        </div>
      )}
    </div>
  );
}