import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2 } from 'lucide-react';

type Watermark = {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  opacity: number;
  color: string;
};

export function Watermark({ file }: { file: File }) {
  const [watermarks, setWatermarks] = useState<Watermark[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedWatermark, setSelectedWatermark] = useState<string | null>(null);
  const [editingWatermark, setEditingWatermark] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [file]);

  useEffect(() => {
    if (preview) {
      const image = new Image();
      image.onload = () => {
        if (canvasRef.current && imageRef.current) {
          const canvas = canvasRef.current;
          canvas.width = image.width;
          canvas.height = image.height;
          imageRef.current.src = preview;
          drawWatermarks();
        }
      };
      image.src = preview;
    }
  }, [preview, watermarks, selectedWatermark, editingWatermark]);

  const drawWatermarks = () => {
    if (canvasRef.current && imageRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        watermarks.forEach(watermark => {
          ctx.font = `${watermark.fontSize}px Arial`;
          ctx.fillStyle = `${watermark.color}${Math.round(watermark.opacity * 255).toString(16).padStart(2, '0')}`;
          ctx.fillText(watermark.text, watermark.x, watermark.y);

          if (watermark.id === selectedWatermark) {
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            const metrics = ctx.measureText(watermark.text);
            ctx.strokeRect(
              watermark.x - 5,
              watermark.y - watermark.fontSize,
              metrics.width + 10,
              watermark.fontSize + 10
            );
          }
        });
      }
    }
  };

  const handleSave = () => {
    if (canvasRef.current && imageRef.current) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = imageRef.current.width;
        canvas.height = imageRef.current.height;
        ctx.drawImage(imageRef.current, 0, 0);
        ctx.drawImage(canvasRef.current, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'watermarked_image.png';
            link.click();
            URL.revokeObjectURL(url);
          }
        }, 'image/png');
      }
    }
  };

  const addWatermark = () => {
    const newWatermark: Watermark = {
      id: Date.now().toString(),
      text: 'Watermark',
      x: 50,
      y: 50,
      fontSize: 24,
      opacity: 0.5,
      color: '#ffffff'
    };
    setWatermarks([...watermarks, newWatermark]);
  };

  const updateWatermark = (id: string, field: keyof Watermark, value: string | number) => {
    setWatermarks(watermarks.map(w => 
      w.id === id ? { ...w, [field]: value } : w
    ));
  };

  const handleColorChange = (id: string, value: string) => {
    const hexColor = value.startsWith('#') ? value : `#${value}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(hexColor)) {
      updateWatermark(id, 'color', hexColor);
    }
  };

  const removeWatermark = (id: string) => {
    setWatermarks(watermarks.filter(w => w.id !== id));
    if (selectedWatermark === id) {
      setSelectedWatermark(null);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const clickedWatermark = watermarks.find(w => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
          ctx.font = `${w.fontSize}px Arial`;
          const metrics = ctx.measureText(w.text);
          return (
            x >= w.x &&
            x <= w.x + metrics.width &&
            y >= w.y - w.fontSize &&
            y <= w.y
          );
        }
        return false;
      });

      setSelectedWatermark(clickedWatermark ? clickedWatermark.id : null);
      setEditingWatermark(null);
    }
  };

  const handleCanvasDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedWatermark) {
      setEditingWatermark(selectedWatermark);
      const watermark = watermarks.find(w => w.id === selectedWatermark);
      if (watermark && inputRef.current) {
        inputRef.current.value = watermark.text;
        inputRef.current.style.left = `${watermark.x}px`;
        inputRef.current.style.top = `${watermark.y - watermark.fontSize}px`;
        inputRef.current.style.fontSize = `${watermark.fontSize}px`;
        inputRef.current.style.color = watermark.color;
        inputRef.current.style.opacity = watermark.opacity.toString();
        inputRef.current.style.display = 'block';
        inputRef.current.focus();
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingWatermark) {
      updateWatermark(editingWatermark, 'text', e.target.value);
    }
  };

  const handleInputBlur = () => {
    setEditingWatermark(null);
    if (inputRef.current) {
      inputRef.current.style.display = 'none';
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedWatermark) {
      setIsDragging(true);
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        setDragStart({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging && selectedWatermark) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const dx = x - dragStart.x;
        const dy = y - dragStart.y;

        setWatermarks(watermarks.map(w =>
          w.id === selectedWatermark
            ? { ...w, x: w.x + dx, y: w.y + dy }
            : w
        ));

        setDragStart({ x, y });
      }
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Watermark Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-2 font-bold text-sm">
            <div>Text</div>
            <div>X</div>
            <div>Y</div>
            <div>Font Size</div>
            <div>Opacity</div>
            <div colSpan={2}>Color</div>
          </div>
          {watermarks.map((watermark) => (
            <div key={watermark.id} className={`grid grid-cols-7 gap-2 mb-2 ${watermark.id === selectedWatermark ? 'bg-red-100' : ''}`}>
              <Input
                value={watermark.text}
                onChange={(e) => updateWatermark(watermark.id, 'text', e.target.value)}
                placeholder="Text"
              />
              <Input
                type="number"
                value={watermark.x}
                onChange={(e) => updateWatermark(watermark.id, 'x', Number(e.target.value))}
                placeholder="X"
              />
              <Input
                type="number"
                value={watermark.y}
                onChange={(e) => updateWatermark(watermark.id, 'y', Number(e.target.value))}
                placeholder="Y"
              />
              <Input
                type="number"
                value={watermark.fontSize}
                onChange={(e) => updateWatermark(watermark.id, 'fontSize', Number(e.target.value))}
                placeholder="Font Size"
              />
              <Input
                type="number"
                value={watermark.opacity}
                onChange={(e) => updateWatermark(watermark.id, 'opacity', Number(e.target.value))}
                placeholder="Opacity"
                min="0"
                max="1"
                step="0.1"
              />
              <div className="flex items-center space-x-2">
                <Input
                  type="color"
                  value={watermark.color}
                  onChange={(e) => updateWatermark(watermark.id, 'color', e.target.value)}
                  className="w-10 h-10 p-0 border-0"
                />
                <Input
                  type="text"
                  value={watermark.color}
                  onChange={(e) => handleColorChange(watermark.id, e.target.value)}
                  placeholder="#FFFFFF"
                  className="flex-grow"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeWatermark(watermark.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button onClick={addWatermark} className="mt-2">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Watermark
          </Button>
        </CardContent>
      </Card>
      <div className="relative">
        <img ref={imageRef} src={preview || ''} alt="Preview" className="max-w-full h-auto select-none" draggable="false"/>
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0"
          onClick={handleCanvasClick}
          onDoubleClick={handleCanvasDoubleClick}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          style={{ userSelect: 'none' }}
        />
        <input
          ref={inputRef}
          type="text"
          className="absolute hidden"
          style={{
            position: 'absolute',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: 'Arial',
          }}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
        />
      </div>
      <Button onClick={handleSave}>Save Watermarked Image</Button>
    </div>
  );
}