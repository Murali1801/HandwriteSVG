// This code provides a CanvasWorkspace component restructured to resemble the Inkscape layout.
// It includes a top header, left sidebar for settings, a main canvas area,
// placeholder areas for right panels and a bottom bar, and basic drawing functionality.
// It now includes functionality for adding text elements, importing images,
// along with selection, dragging, and resizing for these elements.

"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Pen,
  Eraser,
  Grid,
  RotateCcw,
  RotateCw,
  Download,
  Settings,
  Layers,
  Paintbrush,
  Plus,
  Type,
  MousePointer,
  Image as ImageIcon, // Renamed to avoid conflict with HTML Image type
} from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface CanvasWorkspaceProps {
  project: any;
  onBack: () => void;
}

interface CanvasSize {
  name: string;
  width: number;
  height: number;
  unit: "px" | "mm" | "in";
}

// Common interface for all canvas elements
interface CanvasElement {
  id: string;
  type: "text" | "image";
  x: number;
  y: number;
  isSelected: boolean;
  // Add common properties like rotation, opacity, etc. here later if needed
}

interface TextElement extends CanvasElement {
  type: "text";
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  isEditing: boolean; // isEditing is specific to text
}

interface ImageElement extends CanvasElement {
  type: "image";
  img: HTMLImageElement; // Store the actual image element for drawing
  width: number;
  height: number;
  originalWidth: number; // Store original dimensions for aspect ratio
  originalHeight: number;
}

// Type to represent the active resize handle
type ResizeHandle = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

// Interface for resize handle positions
interface ResizeHandles {
  topLeft: { x: number; y: number };
  topRight: { x: number; y: number };
  bottomLeft: { x: number; y: number };
  bottomRight: { x: number; y: number };
}

export function CanvasWorkspace({ project, onBack }: CanvasWorkspaceProps) {
  // Canvas refs and state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [paths, setPaths] = useState<{ x: number; y: number }[][]>([]);
  const [history, setHistory] = useState<{ paths: { x: number; y: number }[][]; elements: CanvasElement[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Tool state
  const [selectedTool, setSelectedTool] = useState<"pen" | "eraser" | "text" | "select" | "image">("pen");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [showGrid, setShowGrid] = useState(true);

  // Combined state for all canvas elements (text, images, etc.)
  const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([]);

  // Selection/Drag/Resize state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activeResizeHandle, setActiveResizeHandle] = useState<ResizeHandle | null>(null);
  const [resizeStartSize, setResizeStartSize] = useState<{
    width: number;
    height: number;
    x: number;
    y: number;
    originalWidth: number;
    originalHeight: number;
  }>({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    originalWidth: 0,
    originalHeight: 0
  });

  // Canvas size state
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({
    name: "A4",
    width: 210,
    height: 297,
    unit: "mm",
  });
  const [customSize, setCustomSize] = useState({ width: 800, height: 600 });
  const [showCustomSizeInput, setShowCustomSizeInput] = useState(false);

  // Predefined canvas sizes
  const canvasSizes: CanvasSize[] = [
    { name: "A4", width: 210, height: 297, unit: "mm" },
    { name: "A3", width: 297, height: 420, unit: "mm" },
    { name: "A5", width: 148, height: 210, unit: "mm" },
    { name: "Letter", width: 8.5, height: 11, unit: "in" },
    { name: "Legal", width: 8.5, height: 14, unit: "in" },
    { name: "Square", width: 1000, height: 1000, unit: "px" },
    { name: "Instagram Post", width: 1080, height: 1080, unit: "px" },
    { name: "Instagram Story", width: 1080, height: 1920, unit: "px" },
    { name: "Twitter Post", width: 1200, height: 675, unit: "px" },
    { name: "Facebook Post", width: 1200, height: 630, unit: "px" },
    { name: "Custom", width: 0, height: 0, unit: "px" },
  ];

  // Text element specific state and dialog visibility
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [editingText, setEditingText] = useState<string>("");
  const [isTextEditingDialogVisible, setIsTextEditingDialogVisible] = useState(false);

  // Canvas size conversion
  const convertToPixels = (
    size: CanvasSize
  ): { width: number; height: number } => {
    const dpi = 96; // Standard screen DPI
    let width = size.width;
    let height = size.height;

    if (size.unit === "mm") {
      width = (size.width * dpi) / 25.4;
      height = (size.height * dpi) / 25.4;
    } else if (size.unit === "in") {
      width = size.width * dpi;
      height = height * dpi;
    }

    return { width, height };
  };

  const handleCanvasSizeChange = (size: CanvasSize) => {
    if (size.name === "Custom") {
      setShowCustomSizeInput(true);
      return;
    }

    setShowCustomSizeInput(false);
    setCanvasSize(size);
  };

  const handleCustomSizeChange = () => {
    const newSize = {
      name: "Custom",
      width: customSize.width,
      height: customSize.height,
      unit: "px",
    };
    setCanvasSize(newSize as CanvasSize);
  };

  // Canvas resizing
  const resizeCanvas = (size: CanvasSize) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width, height } = convertToPixels(size);
    const container = canvas.parentElement; // Get the container of the canvas
    if (!container) return;

    const maxWidth = container.clientWidth;
    const maxHeight = container.clientHeight;

    const scaleX = maxWidth / width;
    const scaleY = maxHeight / height;
    const scale = Math.min(scaleX, scaleY);

    canvas.width = width;
    canvas.height = height;

    canvas.style.width = `${width * scale}px`;
    canvas.style.height = `${height * scale}px`;

    canvas.style.margin = "auto";

    redrawCanvas();
  };

  // Drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / (rect.width / canvas.width);
    const y = (e.clientY - rect.top) / (rect.height / canvas.height);

    setIsDrawing(true);
    setCurrentPath([{ x, y }]);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / (rect.width / canvas.width);
    const y = (e.clientY - rect.top) / (rect.height / canvas.height);

    setCurrentPath((prev) => [...prev, { x, y }]);
    redrawCanvas();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;

    setIsDrawing(false);
    if (currentPath.length > 1) {
      const newPaths = [...paths, currentPath];
      setPaths(newPaths);
      // Add current state (paths + elements) to history
      setHistory((prev) => [
        ...prev.slice(0, historyIndex + 1),
        { paths: newPaths, elements: canvasElements },
      ]);
      setHistoryIndex((prev) => prev + 1);
    }
    setCurrentPath([]);
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (touch.clientX - rect.left) / (rect.width / (canvasRef.current?.width || 1));
    const y = (touch.clientY - rect.top) / (rect.height / (canvasRef.current?.height || 1));

    // Create a synthetic mouse event
    const mouseEvent = new MouseEvent("mousedown", {
      clientX: touch.clientX,
      clientY: touch.clientY,
      bubbles: true,
    });

    // Handle double tap for text editing
    const now = Date.now();
    const timeSinceLastTap = now - (lastTapTime || 0);
    if (timeSinceLastTap < 300) { // 300ms threshold for double tap
      handleDoubleClick(mouseEvent as any);
      setLastTapTime(0);
    } else {
      setLastTapTime(now);
      handleMouseDown(mouseEvent as any);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (touch.clientX - rect.left) / (rect.width / (canvasRef.current?.width || 1));
    const y = (touch.clientY - rect.top) / (rect.height / (canvasRef.current?.height || 1));

    const mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY,
      bubbles: true,
    });
    handleMouseMove(mouseEvent as any);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    handleMouseUp();
  };

  // Add state for tracking double tap
  const [lastTapTime, setLastTapTime] = useState<number>(0);

  // Add pinch zoom handling
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
  const [initialScale, setInitialScale] = useState(1);

  const handleTouchStartMulti = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      setInitialPinchDistance(distance);
      setInitialScale(1); // Reset scale
    }
  };

  const handleTouchMoveMulti = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 2 && initialPinchDistance !== null) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      const scale = distance / initialPinchDistance;
      
      // Apply zoom to canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.scale(scale, scale);
          redrawCanvas();
        }
      }
    }
  };

  // Add text element
  const addText = (x: number, y: number) => {
    const newText: TextElement = {
      id: Date.now().toString(),
      type: "text",
      text: "Double click to edit",
      x,
      y,
      fontSize,
      fontFamily,
      color: strokeColor,
      isEditing: false,
      isSelected: false,
    };
    // Add element and immediately save state
    setCanvasElements(prev => {
        const newElements = [...prev, newText];
         // Add current state (paths + newElements) to history
        setHistory(historyPrev => [
          ...historyPrev.slice(0, historyIndex + 1),
          { paths: paths, elements: newElements },
        ]);
        setHistoryIndex(historyPrev => historyPrev + 1);
        return newElements;
    });

    // Open the dialog immediately after adding text
    setSelectedElementId(newText.id);
    setEditingText(newText.text); // Initialize temporary state
    setIsTextEditingDialogVisible(true); // Show the dialog
    redrawCanvas(); // Redraw with the new element
  };

  // Update text element (used only when closing the dialog now)
  const updateTextElement = (id: string, newText: string) => {
     setCanvasElements(prev => {
        const updatedElements = prev.map(el =>
            el.id === id && el.type === "text" ? { ...(el as TextElement), text: newText } : el
          ) as CanvasElement[];
         // Save state to history after updating text
         setHistory(historyPrev => [
             ...historyPrev.slice(0, historyIndex + 1),
             { paths: paths, elements: updatedElements },
         ]);
         setHistoryIndex(historyPrev => historyPrev + 1);
         return updatedElements;
     });
     redrawCanvas(); // Redraw after updating the text
   };


  // Handle double click for text editing
  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / (rect.width / canvas.width);
    const y = (e.clientY - rect.top) / (rect.height / canvas.height);

    // Find the top-most text element at the click position
    const clickedElement = canvasElements
        .slice()
        .reverse()
        .find(element =>
            element.type === "text" && isPointInElement(x, y, element)
        );


    if (clickedElement && clickedElement.type === "text") {
      const textElement = clickedElement as TextElement; // Explicitly cast
      setSelectedElementId(textElement.id);
      setEditingText(textElement.text); // Access text property
      setIsTextEditingDialogVisible(true); // Show the dialog
    }
  };

  // Handle image import
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const newImage: ImageElement = {
          id: Date.now().toString(),
          type: "image",
          img,
          x: 50, // Initial position
          y: 50, // Initial position
          width: img.width, // Store initial dimensions
          height: img.height,
          originalWidth: img.width, // Store original for aspect ratio
          originalHeight: img.height,
          isSelected: false,
        };
         // Add element and immediately save state
        setCanvasElements(prev => {
            const newElements = [...prev, newImage];
             // Add current state (paths + newElements) to history
            setHistory(historyPrev => [
              ...historyPrev.slice(0, historyIndex + 1),
              { paths: paths, elements: newElements },
            ]);
            setHistoryIndex(historyPrev => historyPrev + 1);
            return newElements;
        });
        setSelectedElementId(newImage.id); // Select the new image
        redrawCanvas(); // Redraw with the new image
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Reset the input so the same file can be uploaded again
    event.target.value = "";
  };


  // Check if a point is within an element (text or image) or a resize handle
  const isPointInElement = (x: number, y: number, element: CanvasElement): boolean => {
      const canvas = canvasRef.current;
      if (!canvas) return false;
      const ctx = canvas.getContext("2d");
      if (!ctx) return false;

      const padding = 5; // Add padding for easier clicking
      const handleSize = 8; // Size of resize handles

      if (element.type === "text") {
          const textElement = element as TextElement;
          ctx.font = `${textElement.fontSize}px ${textElement.fontFamily}`;
          const metrics = ctx.measureText(textElement.text);
          const textLeft = textElement.x;
          const textRight = element.x + metrics.width;
          const textTop = textElement.y - textElement.fontSize;
          const textBottom = textElement.y;

          // Check if point is within text bounding box
          if (x >= textLeft - padding && x <= textRight + padding && y >= textTop - padding && y <= textBottom + padding) {
              return true;
          }

           // Check text resize handles if selected
           if (textElement.isSelected && selectedTool === "select") {
               const handles = getTextResizeHandles(textElement, handleSize);
               for (const handleName in handles) {
                   const handle = handles[handleName as ResizeHandle];
                    if (x >= handle.x - handleSize / 2 && x <= handle.x + handleSize / 2 &&
                       y >= handle.y - handleSize / 2 && y <= handle.y + handleSize / 2) {
                       // We are clicking on a resize handle
                       return true; // Point is in a resize handle
                   }
               }
           }


      } else if (element.type === "image") {
          const imageElement = element as ImageElement;
          const imageLeft = imageElement.x;
          const imageRight = imageElement.x + imageElement.width;
          const imageTop = imageElement.y;
          const imageBottom = imageElement.y + imageElement.height;

          // Check if point is within image bounding box
           if (x >= imageLeft - padding && x <= imageRight + padding && y >= imageTop - padding && y <= imageBottom + padding) {
               return true;
           }

          // Check image resize handles if selected
           if (imageElement.isSelected && selectedTool === "select") {
               const handles = getImageResizeHandles(imageElement, handleSize);
               for (const handleName in handles) {
                   const handle = handles[handleName as ResizeHandle];
                    if (x >= handle.x - handleSize / 2 && x <= handle.x + handleSize / 2 &&
                       y >= handle.y - handleSize / 2 && y <= handle.y + handleSize / 2) {
                       // We are clicking on a resize handle
                       return true; // Point is in a resize handle
                   }
               }
           }
      }
      return false; // Unknown element type or point not in element/handle
  };

  // Get text element resize handle positions
  const getTextResizeHandles = (element: TextElement, handleSize: number): ResizeHandles => {
    const canvas = canvasRef.current;
    if (!canvas) return {
      topLeft: { x: 0, y: 0 },
      topRight: { x: 0, y: 0 },
      bottomLeft: { x: 0, y: 0 },
      bottomRight: { x: 0, y: 0 }
    };
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return {
      topLeft: { x: 0, y: 0 },
      topRight: { x: 0, y: 0 },
      bottomLeft: { x: 0, y: 0 },
      bottomRight: { x: 0, y: 0 }
    };

    ctx.font = `${element.fontSize}px ${element.fontFamily}`;
    const metrics = ctx.measureText(element.text);
    const textLeft = element.x;
    const textRight = element.x + metrics.width;
    const textTop = element.y - element.fontSize;
    const textBottom = element.y;

    return {
      topLeft: { x: textLeft, y: textTop },
      topRight: { x: textRight, y: textTop },
      bottomLeft: { x: textLeft, y: textBottom },
      bottomRight: { x: textRight, y: textBottom },
    };
  };

  // Get image element resize handle positions
  const getImageResizeHandles = (element: ImageElement, handleSize: number): ResizeHandles => {
    return {
      topLeft: { x: element.x, y: element.y },
      topRight: { x: element.x + element.width, y: element.y },
      bottomLeft: { x: element.x, y: element.y + element.height },
      bottomRight: { x: element.x + element.width, y: element.y + element.height },
    };
  };

  // Determine which resize handle is clicked
  const getClickedResizeHandle = (x: number, y: number, element: CanvasElement): ResizeHandle | null => {
       if (!element.isSelected || selectedTool !== "select") return null;

       const handleSize = 8; // Size of resize handles

       if (element.type === "text") {
           const textElement = element as TextElement;
            const handles = getTextResizeHandles(textElement, handleSize);
            for (const handleName in handles) {
                const handle = handles[handleName as ResizeHandle];
                 if (x >= handle.x - handleSize / 2 && x <= handle.x + handleSize / 2 &&
                    y >= handle.y - handleSize / 2 && y <= handle.y + handleSize / 2) {
                    return handleName as ResizeHandle;
                }
            }
       } else if (element.type === "image") {
           const imageElement = element as ImageElement;
           const handles = getImageResizeHandles(imageElement, handleSize);
            for (const handleName in handles) {
                const handle = handles[handleName as ResizeHandle];
                 if (x >= handle.x - handleSize / 2 && x <= handle.x + handleSize / 2 &&
                    y >= handle.y - handleSize / 2 && y <= handle.y + handleSize / 2) {
                    return handleName as ResizeHandle;
                }
            }
       }
       return null;
  };


  // Handle mouse down for selection, dragging, and resizing
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / (rect.width / canvas.width);
    const y = (e.clientY - rect.top) / (rect.height / canvas.height);

    if (selectedTool === "text") {
      addText(x, y);
    } else if (selectedTool === "select") {
        // Find the top-most element at the click position
        const clickedElement = canvasElements
            .slice() // Create a shallow copy to avoid modifying the original array during reverse
            .reverse() // Check elements from top to bottom (last drawn is on top)
            .find(element => isPointInElement(x, y, element));

        // Check if a resize handle was clicked on the currently selected element
        let clickedHandle: ResizeHandle | null = null;
        if (selectedElementId !== null) {
             const selectedElement = canvasElements.find(el => el.id === selectedElementId);
             if (selectedElement) {
                 clickedHandle = getClickedResizeHandle(x, y, selectedElement);
             }
        }


      // If a resize handle was clicked, start resizing
        if (clickedHandle !== null && selectedElementId !== null) {
            setActiveResizeHandle(clickedHandle);
            setIsDragging(true);
             const selectedElement = canvasElements.find(el => el.id === selectedElementId);
             if (selectedElement) {
                if (selectedElement.type === "image") {
                    const imgEl = selectedElement as ImageElement;
                    setResizeStartSize({
                      width: imgEl.width,
                      height: imgEl.height,
                      x: imgEl.x,
                      y: imgEl.y,
                      originalWidth: imgEl.originalWidth,
                      originalHeight: imgEl.originalHeight
                    });
                }
                 // Add logic for text element resizing if implemented later
             }
            setDragStart({ x, y });

        }
      // If an element was clicked (and not a resize handle), start dragging or select it
      else if (clickedElement) {
          // If the clicked element is already selected, start dragging
          if (clickedElement.isSelected) {
              setIsDragging(true);
              setDragStart({ x, y });
          } else {
              // Deselect all others and select the clicked element
              setCanvasElements(prev => prev.map(el => ({ ...el, isSelected: el.id === clickedElement.id })));
              setSelectedElementId(clickedElement.id);
               // Bring selected element to front
                setCanvasElements(prev => {
                    const elementIndex = prev.findIndex(el => el.id === clickedElement.id);
                    if (elementIndex > -1) {
                        const newElements = [...prev];
                        const [element] = newElements.splice(elementIndex, 1);
                        newElements.push(element);
                        return newElements;
                    }
                    return prev;
                });
          }
      }
      // If click is outside any element and handle, deselect all
      else {
         setCanvasElements(prev => prev.map(el => ({ ...el, isSelected: false })));
         setSelectedElementId(null);
         setIsTextEditingDialogVisible(false); // Close text dialog if open
         setEditingText(""); // Clear editing text
      }
    } else { // Pen or Eraser tool
      startDrawing(e);
    }
  };

  // Handle mouse move for dragging and resizing
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / (rect.width / canvas.width);
    const y = (e.clientY - rect.top) / (rect.height / canvas.height);

    if (selectedTool === "select" && isDragging && selectedElementId !== null) {
      const dx = x - dragStart.x;
      const dy = y - dragStart.y;

      // If resizing
      if (activeResizeHandle !== null) {
        setCanvasElements(prev =>
          prev.map(el => {
            if (el.id === selectedElementId && el.type === "image") {
              const imgEl = el as ImageElement;
              let newWidth = imgEl.width;
              let newHeight = imgEl.height;
              let newX = imgEl.x;
              let newY = imgEl.y;

              // Calculate new size based on handle and mouse movement
              switch (activeResizeHandle) {
                case "bottomRight":
                  newWidth = resizeStartSize.width + dx;
                  newHeight = resizeStartSize.height + dy;
                  break;
                case "bottomLeft":
                  newWidth = resizeStartSize.width - dx;
                  newHeight = resizeStartSize.height + dy;
                  newX = resizeStartSize.x + dx;
                  break;
                case "topRight":
                  newWidth = resizeStartSize.width + dx;
                  newHeight = resizeStartSize.height - dy;
                  newY = resizeStartSize.y + dy;
                  break;
                case "topLeft":
                  newWidth = resizeStartSize.width - dx;
                  newHeight = resizeStartSize.height - dy;
                  newX = resizeStartSize.x + dx;
                  newY = resizeStartSize.y + dy;
                  break;
              }

              // Maintain aspect ratio
              const aspectRatio = imgEl.originalWidth / imgEl.originalHeight;
              if (activeResizeHandle === "bottomRight" || activeResizeHandle === "topLeft") {
                newHeight = newWidth / aspectRatio;
                if (activeResizeHandle === "topLeft") {
                  newY = resizeStartSize.y + (resizeStartSize.height - newHeight);
                }
              } else if (activeResizeHandle === "bottomLeft" || activeResizeHandle === "topRight") {
                newWidth = newHeight * aspectRatio;
                if (activeResizeHandle === "topRight") {
                  newX = resizeStartSize.x + (resizeStartSize.width - newWidth);
                }
              }

              // Ensure minimum size
              newWidth = Math.max(10, newWidth);
              newHeight = Math.max(10, newHeight);

              return { ...imgEl, width: newWidth, height: newHeight, x: newX, y: newY };
            }
            return el;
          }) as CanvasElement[]
        );
        setDragStart({ x, y });
      }
      // If dragging
      else {
        setCanvasElements(prev =>
          prev.map(el =>
            el.id === selectedElementId
              ? { ...el, x: el.x + dx, y: el.y + dy }
              : el
          ) as CanvasElement[]
        );
        setDragStart({ x, y });
      }

      redrawCanvas();
    } else if (selectedTool !== "select") { // Pen or Eraser tool
      draw(e);
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    if (selectedTool === "select") {
      setIsDragging(false);
      setActiveResizeHandle(null); // Reset resize handle
       // Save state to history after drag/resize ends
        setHistory(prev => [
              ...prev.slice(0, historyIndex + 1),
              { paths: paths, elements: canvasElements }, // Save the current final state
         ]);
         setHistoryIndex(prev => prev + 1);
    } else { // Pen or Eraser tool
      stopDrawing(); // stopDrawing already saves to history
    }
  };

   // Delete selected element
   const deleteSelectedElement = () => {
     if (selectedElementId !== null) {
       setCanvasElements(prev => {
           const filteredElements = prev.filter(el => el.id !== selectedElementId);
           // Save state to history after deleting element
            setHistory(historyPrev => [
              ...historyPrev.slice(0, historyIndex + 1),
              { paths: paths, elements: filteredElements },
            ]);
            setHistoryIndex(historyPrev => historyPrev + 1);
           return filteredElements;
       });
       setSelectedElementId(null); // Deselect after deleting
       redrawCanvas(); // Redraw to show the change
     }
   };


  // Draw elements on canvas
  const drawCanvasElements = (ctx: CanvasRenderingContext2D) => {
      canvasElements.forEach(element => {
          if (element.type === "text") {
              const textElement = element as TextElement;
              ctx.font = `${textElement.fontSize}px ${textElement.fontFamily}`;
              ctx.fillStyle = textElement.color;
              ctx.fillText(textElement.text, textElement.x, textElement.y);

               // Draw selection indicator and resize handles for text if selected
              if (textElement.isSelected && selectedTool === "select") {
                const metrics = ctx.measureText(textElement.text);
                const height = textElement.fontSize;

                // Bounding box
                ctx.strokeStyle = "#2196F3"; // Blue color for selection
                ctx.lineWidth = 1;
                const textBounds = {
                    x: textElement.x,
                    y: textElement.y - height,
                    width: metrics.width,
                    height: height,
                };
                 ctx.strokeRect(textBounds.x, textBounds.y, textBounds.width, textBounds.height);


                 // Draw resize handles
                 const handleSize = 8;
                 const handles = getTextResizeHandles(textElement, handleSize);
                 ctx.fillStyle = "#2196F3"; // Blue handles
                 ctx.strokeStyle = "#ffffff"; // White border
                 ctx.lineWidth = 1;

                 for (const handleName in handles) {
                     const handle = handles[handleName as ResizeHandle];
                      ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
                      ctx.strokeRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
                 }

              }

          } else if (element.type === "image") {
              const imageElement = element as ImageElement;
              // Ensure image is loaded before drawing
              if (imageElement.img.complete) {
                   ctx.drawImage(imageElement.img, imageElement.x, imageElement.y, imageElement.width, imageElement.height);

                   // Draw selection indicator and resize handles for image if selected
                   if (imageElement.isSelected && selectedTool === "select") {
                     // Bounding box
                     ctx.strokeStyle = "#2196F3"; // Blue color for selection
                     ctx.lineWidth = 1;
                     ctx.strokeRect(
                       imageElement.x,
                       imageElement.y,
                       imageElement.width,
                       imageElement.height
                     );

                      // Draw resize handles
                      const handleSize = 8;
                      const handles = getImageResizeHandles(imageElement, handleSize);
                      ctx.fillStyle = "#2196F3"; // Blue handles
                      ctx.strokeStyle = "#ffffff"; // White border
                      ctx.lineWidth = 1;

                      for (const handleName in handles) {
                          const handle = handles[handleName as ResizeHandle];
                           ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
                           ctx.strokeRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
                      }
                   }
              } else {
                  // If image is not yet loaded, draw a placeholder or handle later
                  console.warn("Image not yet loaded for drawing:", imageElement.id);
                  // Could add an onload handler to redraw when image is ready
                  imageElement.img.onload = () => {
                      redrawCanvas(); // Redraw once image is loaded
                  };
              }
          }
      });
  };


  // Modify redrawCanvas to include drawing all canvas elements
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 1;
      const gridSize = 20;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    // Draw paths
    ctx.strokeStyle = selectedTool === "eraser" ? "#ffffff" : strokeColor;
    ctx.lineWidth = selectedTool === "eraser" ? strokeWidth * 2 : strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    paths.forEach((path) => {
      if (path.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      path.slice(1).forEach((point) => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    });

    // Draw current path (if drawing with pen/eraser)
    if (selectedTool !== "select" && selectedTool !== "text" && selectedTool !== "image" && currentPath.length > 1) {
      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      currentPath.slice(1).forEach((point) => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    }

    // Draw all canvas elements (text, images, etc.)
    drawCanvasElements(ctx);
  };

  // History functions
  const undo = () => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      setPaths(previousState.paths);
      setCanvasElements(previousState.elements); // Restore canvas elements
      setHistoryIndex(prev => prev - 1);
      redrawCanvas();
    } else if (historyIndex === 0) {
       // Go back to an empty state if at the very first recorded step
       setPaths([]);
       setCanvasElements([]);
       setHistoryIndex(-1);
       redrawCanvas();
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setPaths(nextState.paths);
      setCanvasElements(nextState.elements); // Restore canvas elements
      setHistoryIndex(prev => prev + 1);
      redrawCanvas();
    }
  };

  // Export functions
  const exportAsPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Temporarily hide grid for export if desired
    const originalShowGrid = showGrid;
    setShowGrid(false);
    redrawCanvas(); // Redraw without grid

    const link = document.createElement("a");
    link.download = "drawing.png";
    link.href = canvas.toDataURL("image/png");
    link.click();

    // Restore grid state
    setShowGrid(originalShowGrid);
    redrawCanvas();
  };

  const exportAsSVG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", canvas.width.toString());
    svg.setAttribute("height", canvas.height.toString());
    svg.setAttribute("viewBox", `0 0 ${canvas.width} ${canvas.height}`);

    // Add paths to SVG
    paths.forEach((path) => {
      if (path.length < 2) return;
      const pathElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      const d = `M ${path[0].x} ${path[0].y} ${path
        .slice(1)
        .map((p) => `L ${p.x} ${p.y}`)
        .join(" ")}`;
      pathElement.setAttribute("d", d);
      pathElement.setAttribute("stroke", strokeColor);
      pathElement.setAttribute("stroke-width", strokeWidth.toString());
      pathElement.setAttribute("fill", "none");
      pathElement.setAttribute("stroke-linecap", "round");
      pathElement.setAttribute("stroke-linejoin", "round");
      svg.appendChild(pathElement);
    });

    // Add canvas elements (text, images) to SVG
    canvasElements.forEach(element => {
        if(element.type === "text") {
            const textElement = element as TextElement;
            const textElementSvg = document.createElementNS("http://www.w3.org/2000/svg", "text");
            textElementSvg.setAttribute("x", textElement.x.toString());
            // SVG text y coordinate is the baseline, canvas y is the top. Adjust accordingly.
             textElementSvg.setAttribute("y", (textElement.y + textElement.fontSize).toString()); // Approximation
            textElementSvg.setAttribute("font-family", textElement.fontFamily);
            textElementSvg.setAttribute("font-size", `${textElement.fontSize}px`);
            textElementSvg.setAttribute("fill", textElement.color);
            textElementSvg.textContent = textElement.text;
            svg.appendChild(textElementSvg);
        } else if (element.type === "image") {
            const imageElement = element as ImageElement;
             if (imageElement.img.complete) {
               const imageElementSvg = document.createElementNS("http://www.w3.org/2000/svg", "image");
               imageElementSvg.setAttribute("x", imageElement.x.toString());
               imageElementSvg.setAttribute("y", imageElement.y.toString());
               imageElementSvg.setAttribute("width", imageElement.width.toString());
               imageElementSvg.setAttribute("height", imageElement.height.toString());
               imageElementSvg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', imageElement.img.src);
               svg.appendChild(imageElementSvg);
             }
        }
    });


    const svgString = new XMLSerializer().serializeToString(svg);
    const link = document.createElement("a");
    link.download = "drawing.svg";
    link.href =
      "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);
    link.click();
  };

  // Effects
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas(canvasSize);
    });

    resizeObserver.observe(container);

    // Initial resize and redraw
    resizeCanvas(canvasSize);
    // Redraw on initial mount to render any default elements or loaded data
    redrawCanvas();


    return () => resizeObserver.disconnect();
  }, [canvasSize]); // Depend on canvasSize changes for resizing

  // Redraw when paths, canvas elements, or tool settings change
  useEffect(() => {
    redrawCanvas();
  }, [paths, canvasElements, strokeColor, strokeWidth, showGrid, selectedTool]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      {/* Header (Top Menu/Toolbar Area) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b h-16 flex items-center px-4 justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">{project?.name || "Untitled"}</h1>
        </div>

        {/* Canvas Size Selector */}
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {canvasSize.name} ({canvasSize.width} × {canvasSize.height} {canvasSize.unit})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Canvas Size</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {canvasSizes.map((size) => (
                <DropdownMenuItem
                  key={size.name}
                  onClick={() => handleCanvasSizeChange(size)}
                >
                  {size.name} ({size.width} × {size.height} {size.unit})
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Import Image Button */}
        <div className="flex items-center space-x-2">
           <input
               type="file"
               accept="image/*"
               onChange={handleImageUpload}
               className="hidden"
               id="imageUploadInput"
           />
           <Label htmlFor="imageUploadInput" className="cursor-pointer">
               <Button variant="outline" size="sm" asChild>
                   <span>
                       <ImageIcon className="h-4 w-4 mr-2" />
                       Import Image
                   </span>
               </Button>
           </Label>
        </div>


        {/* Undo/Redo/Export Actions */}
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Undo
          </Button>
          <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
            <RotateCw className="h-4 w-4 mr-2" />
            Redo
          </Button>
          <Button variant="outline" size="sm" onClick={exportAsPNG}>
            <Download className="h-4 w-4 mr-2" />
            PNG
          </Button>
          <Button variant="outline" size="sm" onClick={exportAsSVG}>
            <Download className="h-4 w-4 mr-2" />
            SVG
          </Button>
        </div>
      </header>

      {/* Main Content Area (Left Sidebar + Canvas Area + Right Panels) */}
      <div className="flex flex-1 pt-16">
        {/* Left Sidebar (Tools) */}
        <div className="hidden md:block w-16 border-r bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-2 space-y-2 overflow-y-auto flex-shrink-0">
          {/* Tool Icons */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={selectedTool === "pen" ? "default" : "ghost"} size="icon" onClick={() => setSelectedTool("pen")}>
                  <Pen className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Pen Tool</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={selectedTool === "eraser" ? "default" : "ghost"} size="icon" onClick={() => setSelectedTool("eraser")}>
                  <Eraser className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Eraser Tool</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Select Tool */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={selectedTool === "select" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => {
                    setSelectedTool("select");
                     // Deselect all elements when switching to select tool
                    setCanvasElements(prev => prev.map(el => ({ ...el, isSelected: false })));
                    setSelectedElementId(null);
                    setIsTextEditingDialogVisible(false); // Close text dialog
                    setEditingText(""); // Clear editing text
                  }}
                >
                  <MousePointer className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Select Tool</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Text Tool */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={selectedTool === "text" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => {
                    setSelectedTool("text");
                    // Deselect all elements when switching to text tool
                    setCanvasElements(prev => prev.map(el => ({ ...el, isSelected: false })));
                    setSelectedElementId(null);
                    setIsTextEditingDialogVisible(false); // Close text dialog
                    setEditingText(""); // Clear editing text
                  }}
                >
                  <Type className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Text Tool</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
           {/* Image Tool (Placeholder - actual import via button in header for now) */}
           {/*
           <TooltipProvider>
             <Tooltip>
               <TooltipTrigger asChild>
                 <Button
                   variant={selectedTool === "image" ? "default" : "ghost"}
                   size="icon"
                   onClick={() => setSelectedTool("image")} // You could make clicking this open the file dialog
                 >
                   <ImageIcon className="h-5 w-5" />
                 </Button>
               </TooltipTrigger>
               <TooltipContent>
                 <p>Image Tool</p>
               </TooltipContent>
             </Tooltip>
           </TooltipProvider>
           */}

        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col items-center justify-center overflow-hidden p-4 relative">
          {/* Mobile Toolbar - Show only on mobile */}
          <div className="md:hidden fixed bottom-4 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t p-2 flex justify-around">
            <Button variant="ghost" size="icon" onClick={() => setSelectedTool("pen")}>
              <Pen className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setSelectedTool("eraser")}>
              <Eraser className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setSelectedTool("select")}>
              <MousePointer className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setSelectedTool("text")}>
              <Type className="h-5 w-5" />
            </Button>
          </div>

          {/* Canvas Size and Scaled Info */}
          <div className="absolute top-2 right-2 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-lg p-2 shadow-lg flex items-center space-x-2">
            <Badge variant="secondary" className="mr-2">
              {canvasSize.name}
            </Badge>
            <Badge variant="outline">
              {canvasRef.current
                ? `${Math.round(canvasRef.current.width)} × ${Math.round(
                    canvasRef.current.height
                  )}px`
                : "Loading..."}
            </Badge>
          </div>

          {/* Delete Button (Visible when an element is selected) */}
          {selectedElementId !== null && selectedTool === "select" && (
            <Button
              variant="destructive"
              size="sm"
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10"
              onClick={deleteSelectedElement}
            >
              Delete Selected
            </Button>
          )}

          {/* Canvas itself */}
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden w-full h-full">
            <canvas
              ref={canvasRef}
              className="touch-none" // Prevent default touch actions
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={(e) => {
                handleTouchStart(e);
                handleTouchStartMulti(e);
              }}
              onTouchMove={(e) => {
                handleTouchMove(e);
                handleTouchMoveMulti(e);
              }}
              onTouchEnd={handleTouchEnd}
              onDoubleClick={handleDoubleClick}
            />
          </div>
        </div>

        {/* Right Sidebar (Panels: Layers, Fill/Stroke, etc.) */}
        <div className="hidden md:block w-64 border-l bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-4 space-y-4 overflow-y-auto flex-shrink-0">
          {/* Layers and Objects Panel Placeholder */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Layers and Objects</CardTitle></CardHeader>
            <CardContent>
               <div className="text-center text-sm text-gray-500 mb-2">Elements ({canvasElements.length})</div>
                 <ul className="text-xs text-gray-700 dark:text-gray-300 max-h-40 overflow-y-auto">
                   {canvasElements.slice().reverse().map(element => ( // Show in drawing order
                     <li
                       key={element.id}
                       className={`truncate p-1 cursor-pointer ${element.isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
                        onClick={() => {
                           // Simulate selecting by clicking in the layers panel
                           setCanvasElements(prev =>
                               prev.map(el =>
                                   el.id === element.id ? { ...el, isSelected: true } : { ...el, isSelected: false }
                               )
                           );
                            setSelectedElementId(element.id);
                            setSelectedTool("select"); // Switch to select tool
                       }}
                     >
                        {element.type === "text" ? `Text: "${(element as TextElement).text.substring(0, 20)}..."` : `Image: ${element.id.substring(element.id.length - 4)}`}
                     </li>
                   ))}
                 </ul>
            </CardContent>
          </Card>
          {/* Fill and Stroke Panel Placeholder */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Fill and Stroke</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="fillColor">Fill</Label>
                <Input id="fillColor" type="color" defaultValue="#ffffff" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="strokeColorPanel">Stroke</Label>
                <Input id="strokeColorPanel" type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} />
              </div>
               <div className="space-y-2">
                 <Label htmlFor="strokeWidth">Stroke Width</Label>
                 <Input id="strokeWidth" type="number" value={strokeWidth} onChange={(e) => setStrokeWidth(Number(e.target.value))} min={1} max={50}/>
              </div>
            </CardContent>
          </Card>
          {/* Text Settings Panel */}
          {selectedTool === "text" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Text Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fontSize">Font Size</Label>
                    <Input
                      id="fontSize"
                      type="number"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      min={8}
                      max={72}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fontFamily">Font Family</Label>
                    <select
                      id="fontFamily"
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                      <option value="Georgia">Georgia</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
           {/* Element Properties Panel (Could show properties of selected element) */}
            {selectedElementId !== null && selectedTool === "select" && (
                 <Card>
                      <CardHeader>
                           <CardTitle className="text-sm">Element Properties</CardTitle>
                      </CardHeader>
                      <CardContent>
                          {/* Placeholder for properties like position, size, etc. */}
                          <div className="text-center text-sm text-gray-500">Select an element</div>
                      </CardContent>
                 </Card>
            )}
          {/* Custom Size Input Panel */}
            {showCustomSizeInput && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Custom Size (px)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="customWidthInput">Width</Label>
                                <Input
                                    id="customWidthInput"
                                    type="number"
                                    value={customSize.width}
                                    onChange={(e) => setCustomSize({ ...customSize, width: Number(e.target.value) })}
                                    min={100}
                                    max={4000}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="customHeightInput">Height</Label>
                                <Input
                                    id="customHeightInput"
                                    type="number"
                                    value={customSize.height}
                                    onChange={(e) => setCustomSize({ ...customSize, height: Number(e.target.value) })}
                                    min={100}
                                    max={4000}
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setShowCustomSizeInput(false)}>Cancel</Button>
                                <Button onClick={handleCustomSizeChange}>Apply</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
      </div>

      {/* Bottom Bar - Adjust for mobile */}
      <div className="h-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t flex items-center px-4 overflow-x-auto flex-shrink-0">
        {/* Status and Coordinates - Hide on mobile */}
        <div className="hidden md:block flex-1 text-right text-xs text-gray-600 dark:text-gray-300 ml-4">
          X: 0.00 Y: 0.00 | Z: 100% | Layer 1
        </div>
      </div>

      {/* Text Editing Dialog */}
      {isTextEditingDialogVisible && selectedElementId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Edit Text</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="textInput">Text</Label>
                <Input
                  id="textInput"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    updateTextElement(selectedElementId, editingText); // Update actual text element
                    // Close the dialog and reset temporary state
                    setIsTextEditingDialogVisible(false); // Hide the dialog
                    // setSelectedElementId(null); // Keep selected after editing? Or deselect? Let's keep selected for now.
                    setEditingText(""); // Clear temporary state
                    // redrawCanvas(); // Redraw is handled by updateTextElement
                  }}
                >
                  Done
                </Button>
                 <Button
                   variant="outline"
                   onClick={() => {
                     // Cancel editing, close dialog and reset temporary state
                     setIsTextEditingDialogVisible(false); // Hide the dialog
                    // setSelectedElementId(null); // Keep selected? Let's keep selected.
                     setEditingText(""); // Clear temporary state
                     // redrawCanvas(); // Redraw is not needed as state wasn't changed
                   }}
                 >
                   Cancel
                 </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}