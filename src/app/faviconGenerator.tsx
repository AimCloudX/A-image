'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"

export function FaviconGenerator({ file }:{file:File}) {
  const [text, setText] = useState('')
  const [fontSize, setFontSize] = useState(20)
  const [fontFamily, setFontFamily] = useState('Arial')
  const [textColor, setTextColor] = useState('#000000')
  const [useBackgroundImage, setUseBackgroundImage] = useState(true)
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF')
  const [shape, setShape] = useState<'circle' | 'square'>('circle')
  const [size, setSize] = useState(128)
  const [fileType, setFileType] = useState<'png' | 'ico'  >('png')
  const [fileName, setFileName] = useState('')

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    drawIcon()
  }, [text, fontSize, fontFamily, textColor, useBackgroundImage, backgroundColor, shape, size])

  const drawIcon = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = canvas.width
    tempCanvas.height = canvas.height
    const tempCtx = tempCanvas.getContext('2d')
    if (!tempCtx) return

    if (useBackgroundImage) {
      const img = new Image()
      img.onload = () => {
        tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height)
        applyShapeAndDrawText(ctx, tempCanvas)
      }
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
    } else {
      tempCtx.fillStyle = backgroundColor
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
      applyShapeAndDrawText(ctx, tempCanvas)
    }
  }

  const applyShapeAndDrawText = (ctx: CanvasRenderingContext2D, tempCanvas: HTMLCanvasElement) => {
    ctx.save()
    ctx.beginPath()
    if (shape === 'circle') {
      ctx.arc(ctx.canvas.width / 2, ctx.canvas.height / 2, ctx.canvas.width / 2, 0, Math.PI * 2)
    } else {
      ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height)
    }
    ctx.clip()
    ctx.drawImage(tempCanvas, 0, 0)
    ctx.restore()

    ctx.fillStyle = textColor
    ctx.font = `${fontSize}px ${fontFamily}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, ctx.canvas.width / 2, ctx.canvas.height / 2)
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    let dataUrl: string
    dataUrl = canvas.toDataURL(`image/${fileType}`)

    const link = document.createElement('a')
    link.download = fileName || `icon.${fileType}`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-background rounded-lg shadow-md">
      <Tabs defaultValue="text" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="text">テキスト</TabsTrigger>
          <TabsTrigger value="appearance">外観</TabsTrigger>
          <TabsTrigger value="export">エクスポート</TabsTrigger>
        </TabsList>
        <TabsContent value="text" className="space-y-4">
          <Input
            placeholder="アイコンのテキストを入力"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="space-y-2">
            <Label>フォントサイズ: {fontSize}px</Label>
            <Slider
              min={10}
              max={50}
              step={1}
              value={[fontSize]}
              onValueChange={(value) => setFontSize(value[0])}
            />
          </div>
          <Select value={fontFamily} onValueChange={setFontFamily}>
            <SelectTrigger>
              <SelectValue placeholder="フォントを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Arial">Arial</SelectItem>
              <SelectItem value="Verdana">Verdana</SelectItem>
              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
              <SelectItem value="Courier">Courier</SelectItem>
              <SelectItem value="Georgia">Georgia</SelectItem>
              <SelectItem value="Palatino">Palatino</SelectItem>
              <SelectItem value="Garamond">Garamond</SelectItem>
              <SelectItem value="Bookman">Bookman</SelectItem>
              <SelectItem value="Comic Sans MS">Comic Sans MS</SelectItem>
              <SelectItem value="Trebuchet MS">Trebuchet MS</SelectItem>
              <SelectItem value="Arial Black">Arial Black</SelectItem>
              <SelectItem value="Impact">Impact</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2">
            <Label htmlFor="textColor">テキスト色:</Label>
            <Input
              id="textColor"
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-16 h-8"
            />
          </div>
        </TabsContent>
        <TabsContent value="appearance" className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="useBackgroundImage"
              checked={useBackgroundImage}
              onCheckedChange={setUseBackgroundImage}
            />
            <Label htmlFor="useBackgroundImage">背景画像を使用</Label>
          </div>
          {!useBackgroundImage && (
            <div className="flex items-center space-x-2">
              <Label htmlFor="backgroundColor">背景色:</Label>
              <Input
                id="backgroundColor"
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-16 h-8"
              />
            </div>
          )}
          <Select value={shape} onValueChange={(value: 'circle' | 'square') => setShape(value)}>
            <SelectTrigger>
              <SelectValue placeholder="形状を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="circle">円形</SelectItem>
              <SelectItem value="square">正方形</SelectItem>
            </SelectContent>
          </Select>
          <Select value={size.toString()} onValueChange={(value) => setSize(parseInt(value))}>
            <SelectTrigger>
              <SelectValue placeholder="サイズを選択" />
            </SelectTrigger>
            <SelectContent>
              {[15, 24, 32, 48, 64, 128, 256].map((s) => (
                <SelectItem key={s} value={s.toString()}>{`${s}x${s}`}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TabsContent>
        <TabsContent value="export" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fileName">ファイル名:</Label>
            <Input
              id="fileName"
              placeholder="ファイル名を入力（空の場合はデフォルト名）"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
          </div>
          <Select value={fileType} onValueChange={(value: 'png' | 'ico' | 'svg') => setFileType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="ファイル形式を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="png">PNG</SelectItem>
              <SelectItem value="ico">ICO</SelectItem>
              <SelectItem value="svg">SVG</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleDownload} className="w-full">ダウンロード</Button>
        </TabsContent>
      </Tabs>
      <Card className="mt-6">
        <CardContent className="flex justify-center items-center p-6">
          <canvas
            ref={canvasRef}
            width={size}
            height={size}
            style={{ width: '256px', height: '256px' }}
          />
        </CardContent>
      </Card>
    </div>
  )
}