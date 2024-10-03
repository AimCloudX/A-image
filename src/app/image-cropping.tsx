"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { loadImage, dataURLtoFile } from './utils';

export function ImageCropping({ file }: { file: File }) {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [endPos, setEndPos] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const loadAndDisplayImage = async () => {
      try {
        const img = await loadImage(file);
        setOriginalImage(img);
        setImage(img);
        adjustCanvasSize(img);
      } catch (error) {
        console.error('Failed to load image:', error);
      }
    };
    loadAndDisplayImage();
  }, [file]);

  useEffect(() => {
    if (image) {
      drawImage();
    }
  }, [image, scale]);

  const adjustCanvasSize = (img: HTMLImageElement) => {
    const canvas = canvasRef.current!;
    const overlay = overlayRef.current!;
    const maxWidth = window.innerWidth * 0.8;
    const maxHeight = window.innerHeight * 0.8;
    let newWidth = img.width;
    let newHeight = img.height;

    if (newWidth > maxWidth) {
      newHeight = (maxWidth / newWidth) * newHeight;
      newWidth = maxWidth;
    }

    if (newHeight > maxHeight) {
      newWidth = (maxHeight / newHeight) * newWidth;
      newHeight = maxHeight;
    }

    canvas.width = newWidth;
    canvas.height = newHeight;
    overlay.width = newWidth;
    overlay.height = newHeight;
    setScale(newWidth / img.width);
  };

  const drawImage = () => {
    if (!image) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const overlay = overlayRef.current!;
    const rect = overlay.getBoundingClientRect();
    setStartPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const overlay = overlayRef.current!;
    const rect = overlay.getBoundingClientRect();
    setEndPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    drawSelectionArea();
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const drawSelectionArea = () => {
    const overlay = overlayRef.current!;
    const ctx = overlay.getContext('2d')!;
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      startPos.x,
      startPos.y,
      endPos.x - startPos.x,
      endPos.y - startPos.y
    );
  };

  const handleCrop = () => {
    if (!image) return;
    const canvas = canvasRef.current!;
    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d')!;

    const width = Math.abs(endPos.x - startPos.x);
    const height = Math.abs(endPos.y - startPos.y);

    if (width === 0 || height === 0) {
      alert("トリミング領域が選択されていません。");
      return;
    }

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

    const croppedImg = new Image();
    croppedImg.onload = () => {
      setImage(croppedImg);
      adjustCanvasSize(croppedImg);
      clearOverlay();
    };
    croppedImg.src = dataURL;
  };

  const handleReset = () => {
    if (originalImage) {
      setImage(originalImage);
      adjustCanvasSize(originalImage);
      setCroppedFile(null);
      clearOverlay();
    }
  };

  const clearOverlay = () => {
    const overlay = overlayRef.current!;
    const ctx = overlay.getContext('2d')!;
    ctx.clearRect(0, 0, overlay.width, overlay.height);
  };

  return (
    <div className="space-y-4">
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <canvas
          ref={canvasRef}
          style={{ border: '1px solid #ccc', maxWidth: '100%', maxHeight: '80vh' }}
        />
        <canvas
          ref={overlayRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'auto',
          }}
        />
      </div>
      <div className="flex space-x-4">
        <Button onClick={handleCrop}>Crop</Button>
        <Button onClick={handleReset}>Reset</Button>
      </div>
      {croppedFile && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Cropped Image Preview</h3>
          <img 
            src={URL.createObjectURL(croppedFile)} 
            alt="Cropped preview" 
            style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }} 
          />
          <p className="mt-2">Cropped file: {croppedFile.name}</p>
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