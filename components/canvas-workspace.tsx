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
  Menu,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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

    // Set canvas size based on screen size
    const isMobile = window.innerWidth < 768
    canvas.width = isMobile ? window.innerWidth - 32 : 800
    canvas.height = isMobile ? window.innerHeight - 200 : 600

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

  // Add touch event handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const touch = e.touches[0]
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY
    })
    canvasRef.current?.dispatchEvent(mouseEvent)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const touch = e.touches[0]
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY
    })
    canvasRef.current?.dispatchEvent(mouseEvent)
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const mouseEvent = new MouseEvent('mouseup', {})
    canvasRef.current?.dispatchEvent(mouseEvent)
  }

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Canvas
            </span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="sm:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row absolute sm:relative top-16 sm:top-0 right-4 sm:right-0 bg-white dark:bg-gray-900 sm:bg-transparent p-4 sm:p-0 rounded-lg shadow-lg sm:shadow-none border sm:border-0`}>
              <Button variant="ghost" size="sm" onClick={clearCanvas}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
              <Button variant="ghost" size="sm" onClick={exportPNG}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Tools Panel */}
            <div className="lg:col-span-1">
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-3 gap-2">
                    {tools.map((t) => (
                      <Button
                        key={t.id}
                        variant={tool === t.id ? "default" : "outline"}
                        size="sm"
                        className="w-full"
                        onClick={() => setTool(t.id as any)}
                      >
                        <t.icon className="h-4 w-4" />
                        <span className="sr-only sm:not-sr-only sm:ml-2">{t.label}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Settings Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Stroke Width</Label>
                    <Slider
                      value={strokeWidth}
                      onValueChange={setStrokeWidth}
                      min={1}
                      max={20}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Color</Label>
                    <Input
                      type="color"
                      value={strokeColor}
                      onChange={(e) => setStrokeColor(e.target.value)}
                      className="mt-2 h-8 w-full"
                    />
                  </div>
                  <div>
                    <Label>Canvas Size</Label>
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
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowGrid(!showGrid)}
                      className="flex-1"
                    >
                      <Grid3X3 className="h-4 w-4 mr-2" />
                      {showGrid ? "Hide Grid" : "Show Grid"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Canvas Area */}
            <div className="lg:col-span-3">
              <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                />
              </div>
            </div>
          </div>

          {/* Handwriting Generator Panel */}
          {tool === "handwriting" && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Handwriting Generator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Text</Label>
                    <Textarea
                      value={handwritingText}
                      onChange={(e) => setHandwritingText(e.target.value)}
                      placeholder="Enter text to generate handwriting..."
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Style</Label>
                    <Slider
                      value={[handwritingStyle]}
                      onValueChange={(value) => setHandwritingStyle(value[0])}
                      min={1}
                      max={10}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Bias</Label>
                    <Slider
                      value={[handwritingBias]}
                      onValueChange={(value) => setHandwritingBias(value[0])}
                      min={0}
                      max={1}
                      step={0.01}
                      className="mt-2"
                    />
                  </div>
                  <Button
                    onClick={generateHandwriting}
                    disabled={handwritingLoading}
                    className="w-full"
                  >
                    {handwritingLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Handwriting"
                    )}
                  </Button>
                  {handwritingStatus && (
                    <p className={`text-sm ${handwritingStatus.isError ? "text-red-500" : "text-green-500"}`}>
                      {handwritingStatus.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
