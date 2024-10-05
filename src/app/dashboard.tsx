"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Upload, Image, Layers, Zap, Stamp, Clapperboard, Eraser, Crop, PenTool } from "lucide-react"
import { FormatConversion } from "./format-conversion"
import { ImageCompression } from "./image-compression"
import { Watermark } from "./watermark"
import { FaviconGenerator } from "./faviconGenerator"
import { ImageCropping } from "./image-cropping"

export default function Dashboard() {
  const [files, setFiles] = useState<File[]>([])
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const { toast } = useToast()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null) // プレビュー用のURL

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files)
      setFiles(selectedFiles)
       // 画像のプレビューURLを作成
      const preview = URL.createObjectURL(selectedFiles[0])
      setPreviewUrl(preview)

      toast({
        title: "ファイルがアップロードされました",
        description: `${e.target.files.length}個のファイルが選択されました。`,
      })
    }
  }

  const services = [
    { name: "フォーマット変換", icon: <Image className="w-6 h-6" />, component: FormatConversion },
    { name: "圧縮・最適化", icon: <Zap className="w-6 h-6" />, component: ImageCompression },
    // { name: "フィルター追加", icon: <Image className="w-6 h-6" /> },
    { name: "透かし追加", icon: <Stamp className="w-6 h-6" />, component: Watermark },
    // { name: "GIF作成", icon: <Clapperboard className="w-6 h-6" /> },
    // { name: "モザイク処理", icon: <Eraser className="w-6 h-6" /> },
    { name: "トリミング", icon: <Crop className="w-6 h-6" />, component: ImageCropping },
    { name: "アイコンメーカー", icon: <PenTool className="w-6 h-6" />, component: FaviconGenerator },
  ]

  const renderSelectedService = () => {
    const service = services.find(s => s.name === selectedService)
    if (service && service.component && files.length > 0) {
      const ServiceComponent = service.component
      return <ServiceComponent file={files[0]} />
    }
    return null
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">画像処理ダッシュボード</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>画像アップロード</CardTitle>
            <CardDescription>処理したい画像をアップロードしてください</CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="picture" className="cursor-pointer">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary">
                <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">クリックまたはドラッグ＆ドロップでアップロード</p>
              </div>
              <Input id="picture" type="file" multiple className="sr-only" onChange={handleFileChange} />
            </Label>
                      {previewUrl && (
                          <div style={{ marginTop: "20px" }}>
                              <img src={previewUrl} alt="Preview" style={{ maxWidth: "100%", height: "auto" }} />
                          </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>画像処理サービス</CardTitle>
            <CardDescription>利用したいサービスを選択してください</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {services.map((service) => (
                <Button
                  key={service.name}
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center"
                  onClick={() => setSelectedService(service.name)}
                >
                  {service.icon}
                  <span className="mt-2 text-xs text-center">{service.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      {selectedService && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{selectedService}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderSelectedService()}
          </CardContent>
        </Card>
      )}
    </div>
  )
}