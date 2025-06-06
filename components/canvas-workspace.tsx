"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  PenTool,
  Eraser,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Save,
  Upload,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Settings,
  Type,
  ImageIcon,
  Grid3X3,
  MousePointer,
  Loader2,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Textarea } from "@/components/ui/textarea"

interface CanvasWorkspaceProps {
  project: any
  onBack: () => void
}

export function CanvasWorkspace({ project, onBack }: CanvasWorkspaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState<"pen" | "eraser" | "select" | "handwriting">("pen")
  const [strokeWidth, setStrokeWidth] = useState([3])
  const [strokeColor, setStrokeColor] = useState("#000000")
  const [zoom, setZoom] = useState(100)
  const [showGrid, setShowGrid] = useState(true)
  const [canvasSize, setCanvasSize] = useState("A4")
  const [layers, setLayers] = useState([
    { id: 1, name: "Background", visible: true, locked: false },
    { id: 2, name: "Drawing", visible: true, locked: false },
  ])
  const [handwritingText, setHandwritingText] = useState("")
  const [handwritingStyle, setHandwritingStyle] = useState(9)
  const [handwritingBias, setHandwritingBias] = useState(0.75)
  const [handwritingLoading, setHandwritingLoading] = useState(false)
  const [handwritingStatus, setHandwritingStatus] = useState<{ message: string; isError: boolean } | null>(null)
  const [selectedElements, setSelectedElements] = useState<any[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const tools = [
    { id: "select", icon: MousePointer, label: "Select" },
    { id: "pen", icon: PenTool, label: "Pen" },
    { id: "eraser", icon: Eraser, label: "Eraser" },
    { id: "text", icon: Type, label: "Text" },
    { id: "image", icon: ImageIcon, label: "Image" },
    { id: "handwriting", icon: PenTool, label: "Handwriting" },
  ]

  const canvasSizes = [
    { value: "A4", label: "A4 (210×297mm)" },
    { value: "Letter", label: "Letter (8.5×11in)" },
    { value: "Square", label: "Square (1000×1000px)" },
    { value: "Custom", label: "Custom Size" },
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = 800
    canvas.height = 600

    // Set default styles
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = strokeWidth[0]

    // Draw grid if enabled
    if (showGrid) {
      drawGrid(ctx, canvas.width, canvas.height)
    }
  }, [strokeColor, strokeWidth, showGrid])

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 20
    ctx.save()
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 0.5
    ctx.globalAlpha = 0.5

    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    ctx.restore()
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== "pen" && tool !== "eraser") return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setIsDrawing(true)

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || (tool !== "pen" && tool !== "eraser")) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out"
      ctx.lineWidth = strokeWidth[0] * 2
    } else {
      ctx.globalCompositeOperation = "source-over"
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = strokeWidth[0]
    }

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (showGrid) {
      drawGrid(ctx, canvas.width, canvas.height)
    }
  }

  const exportSVG = () => {
    // SVG export logic would go here
    console.log("Exporting as SVG...")
  }

  const exportPNG = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = "canvas.png"
    link.href = canvas.toDataURL()
    link.click()
  }

  const generateHandwriting = async () => {
    if (!handwritingText) {
      setHandwritingStatus({ message: "Please enter some text", isError: true })
      return
    }

    setHandwritingLoading(true)
    setHandwritingStatus(null)

    try {
      const response = await fetch("https://handwriting-api-j4gv.onrender.com/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: handwritingText,
          style: handwritingStyle,
          bias: handwritingBias,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const svg = await response.text()
      // Convert SVG to a data URL
      const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
      const svgUrl = URL.createObjectURL(svgBlob)

      // Create an image from the SVG data URL
      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Calculate scaling to fit the canvas while maintaining aspect ratio
        const scale = Math.min(
          (canvas.width * 0.8) / img.width,
          (canvas.height * 0.8) / img.height
        )

        // Calculate position to center the image
        const x = (canvas.width - img.width * scale) / 2
        const y = (canvas.height - img.height * scale) / 2

        // Save the current context state
        ctx.save()
        
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        // Draw grid if enabled
        if (showGrid) {
          drawGrid(ctx, canvas.width, canvas.height)
        }

        // Draw the SVG image onto the canvas with scaling and centering
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale)
        
        // Restore the context state
        ctx.restore()

        // Add the generated SVG to selected elements for manipulation
        setSelectedElements([
          {
            type: 'svg',
            x,
            y,
            width: img.width * scale,
            height: img.height * scale,
            svg: svg,
            scale: scale
          }
        ])

        URL.revokeObjectURL(svgUrl)
      }
      img.src = svgUrl

      setHandwritingStatus({ message: "Handwriting generated successfully!", isError: false })
    } catch (error) {
      console.error("Error:", error)
      setHandwritingStatus({ message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`, isError: true })
    } finally {
      setHandwritingLoading(false)
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === "select") {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Check if click is within any selected element
      const clickedElement = selectedElements.find(element => {
        return x >= element.x && 
               x <= element.x + element.width && 
               y >= element.y && 
               y <= element.y + element.height
      })

      if (clickedElement) {
        setIsDragging(true)
        setDragStart({ x, y })
      } else {
        // Clear selection if clicking outside elements
        setSelectedElements([])
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging && tool === "select") {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const dx = x - dragStart.x
      const dy = y - dragStart.y

      // Move selected elements
      setSelectedElements((prev) =>
        prev.map((el) => ({
          ...el,
          x: el.x + dx,
          y: el.y + dy,
        }))
      )

      // Redraw canvas with updated positions
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (showGrid) {
        drawGrid(ctx, canvas.width, canvas.height)
      }

      // Redraw all selected elements
      selectedElements.forEach(element => {
        if (element.type === 'svg') {
          const img = new Image()
          img.onload = () => {
            ctx.drawImage(
              img,
              element.x,
              element.y,
              element.width,
              element.height
            )
          }
          img.src = URL.createObjectURL(new Blob([element.svg], { type: "image/svg+xml;charset=utf-8" }))
        }
      })

      setDragStart({ x, y })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const groupSelectedElements = () => {
    if (selectedElements.length > 1) {
      // Group logic would go here
      console.log("Grouping selected elements:", selectedElements)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="font-semibold">{project.name}</h1>
              <p className="text-sm text-gray-500">Last saved 2 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={exportSVG}>Export as SVG</DropdownMenuItem>
                <DropdownMenuItem onClick={exportPNG}>Export as PNG</DropdownMenuItem>
                <DropdownMenuItem>Export as PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Left Sidebar - Tools */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 space-y-6">
          {/* Tools */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tools.map((toolItem) => (
                <Button
                  key={toolItem.id}
                  variant={tool === toolItem.id ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setTool(toolItem.id as any)}
                >
                  <toolItem.icon className="h-4 w-4 mr-2" />
                  {toolItem.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Brush Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Brush Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs">Stroke Width</Label>
                <Slider value={strokeWidth} onValueChange={setStrokeWidth} max={20} min={1} step={1} className="mt-2" />
                <div className="text-xs text-gray-500 mt-1">{strokeWidth[0]}px</div>
              </div>
              <div>
                <Label className="text-xs">Color</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="color"
                    value={strokeColor}
                    onChange={(e) => setStrokeColor(e.target.value)}
                    className="w-8 h-8 rounded border"
                  />
                  <Input value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} className="text-xs" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Canvas Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Canvas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs">Size</Label>
                <Select value={canvasSize} onValueChange={setCanvasSize}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {canvasSizes.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Show Grid</Label>
                <Button variant="ghost" size="sm" onClick={() => setShowGrid(!showGrid)}>
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Undo2 className="h-4 w-4 mr-2" />
                Undo
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Redo2 className="h-4 w-4 mr-2" />
                Redo
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Upload className="h-4 w-4 mr-2" />
                Import Image
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-red-600 hover:text-red-700"
                onClick={clearCanvas}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Canvas
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Canvas Toolbar */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{zoom}%</Badge>
                <Button variant="ghost" size="sm" onClick={() => setZoom(Math.max(25, zoom - 25))}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setZoom(Math.min(400, zoom + 25))}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setZoom(100)}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{canvasSize}</Badge>
                <Badge variant="outline">800 × 600px</Badge>
              </div>
            </div>
          </div>

          {/* Canvas Container */}
          <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-8">
            <div className="flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-lg"
                style={{ transform: `scale(${zoom / 100})` }}
              >
                <canvas
                  ref={canvasRef}
                  className="border border-gray-300 rounded-lg cursor-crosshair"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Layers & Preview */}
        <div className="w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 space-y-6">
          {/* Layers */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Layers</CardTitle>
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {layers.map((layer) => (
                <div
                  key={layer.id}
                  className="flex items-center justify-between p-2 rounded border hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      {layer.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    </Button>
                    <span className="text-sm">{layer.name}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Settings className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* SVG Preview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">SVG Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded border flex items-center justify-center">
                <div className="text-xs text-gray-500">SVG preview will appear here</div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                <div>Elements: 0</div>
                <div>File size: ~0 KB</div>
              </div>
            </CardContent>
          </Card>

          {/* Text to Handwriting */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Text to Handwriting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Type text here..." className="text-sm" />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select font style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="cursive">Cursive</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" className="w-full">
                Generate Handwriting
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {tool === "handwriting" && (
        <div className="border-t p-4">
          <h3 className="text-lg font-medium mb-4">Handwriting Generator</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="handwriting-text" className="text-sm font-medium">
                Enter Text:
              </label>
              <Textarea
                id="handwriting-text"
                value={handwritingText}
                onChange={(e) => setHandwritingText(e.target.value)}
                placeholder="Type or paste your text here..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">
                  Style (1-10): {handwritingStyle}
                </label>
                <Slider
                  value={[handwritingStyle]}
                  onValueChange={(value) => setHandwritingStyle(value[0])}
                  min={1}
                  max={10}
                  step={1}
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Bias (0.1-1.0): {handwritingBias}
                </label>
                <Slider
                  value={[handwritingBias]}
                  onValueChange={(value) => setHandwritingBias(value[0])}
                  min={0.1}
                  max={1.0}
                  step={0.05}
                />
              </div>
            </div>
            <div className="flex justify-center">
              <Button
                onClick={generateHandwriting}
                disabled={handwritingLoading}
              >
                {handwritingLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Handwriting"
                )}
              </Button>
            </div>
            {handwritingStatus && (
              <div
                className={`p-3 rounded-md ${
                  handwritingStatus.isError
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {handwritingStatus.message}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
