'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const RENDER_URL = 'https://handwriting-api-j4gv.onrender.com';

export function HandwritingGenerator() {
    const [text, setText] = useState('');
    const [style, setStyle] = useState('10');
    const [bias, setBias] = useState(1);
    const [line_spacing, setLineSpacing] = useState(1);
    const [text_align, setTextAlignment] = useState('left');
    const [font_size, setFontSize] = useState(1.0);
    const [loading, setLoading] = useState(false);
    const [svgContent, setSvgContent] = useState('');
    const [status, setStatus] = useState<{ message: string; isError: boolean } | null>(null);

    const generateHandwriting = async () => {
        if (!text) {
            setStatus({ message: 'Please enter some text', isError: true });
            return;
        }

        setLoading(true);
        setSvgContent('');
        setStatus(null);

        try {
            const response = await fetch(`${RENDER_URL}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text,
                    style,
                    bias,
                    line_spacing,
                    text_align,
                    font_size
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const svg = await response.text();
            setSvgContent(svg);
            setStatus({ message: 'Handwriting generated successfully!', isError: false });
        } catch (error) {
            console.error('Error:', error);
            setStatus({ message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, isError: true });
        } finally {
            setLoading(false);
        }
    };

    const downloadSVG = () => {
        if (!svgContent) {
            setStatus({ message: 'No handwriting to download', isError: true });
            return;
        }

        const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);

        const downloadLink = document.createElement('a');
        downloadLink.href = svgUrl;
        downloadLink.download = 'handwriting.svg';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(svgUrl);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 sm:py-12">
            {/* Main Content */}
            <div className="container mx-auto max-w-4xl px-3 sm:px-4">
                {/* Header Section */}
                <div className="text-center mb-6 sm:mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Handwriting Generator</h1>
                    <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-2">
                        Transform your text into beautiful handwritten SVG. Customize the style, spacing, and alignment to create the perfect handwritten look.
                    </p>
                </div>

                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg px-4 sm:px-6 py-4 sm:py-6">
                        <CardTitle className="text-center text-xl sm:text-2xl">Create Your Handwriting</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        <div className="space-y-6 sm:space-y-8">
                            {/* Text Input Section */}
                            <div className="space-y-2">
                                <label htmlFor="text" className="text-sm font-medium text-gray-700">
                                    Enter Text:
                                </label>
                                <Textarea
                                    id="text"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Type or paste your text here..."
                                    rows={4}
                                    className="border-2 focus:border-blue-500 transition-colors text-base sm:text-lg"
                                />
                            </div>

                            {/* Controls Section */}
                            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                                <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-4">Customization Options</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="space-y-2 bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                                        <label className="text-sm font-medium text-gray-700">
                                            Style (0-12): {style}
                                        </label>
                                        <Slider
                                            value={[parseInt(style)]}
                                            onValueChange={(value) => setStyle(value[0].toString())}
                                            min={0}
                                            max={12}
                                            step={1}
                                            className="mt-2 touch-manipulation"
                                        />
                                    </div>
                                    <div className="space-y-2 bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                                        <label className="text-sm font-medium text-gray-700">
                                            Bias (0.1-1.0): {bias}
                                        </label>
                                        <Slider
                                            value={[bias]}
                                            onValueChange={(value) => setBias(value[0])}
                                            min={0.1}
                                            max={1.0}
                                            step={0.05}
                                            className="mt-2 touch-manipulation"
                                        />
                                    </div>
                                    <div className="space-y-2 bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                                        <label className="text-sm font-medium text-gray-700">
                                            Line Spacing (cm): {line_spacing}
                                        </label>
                                        <Slider
                                            value={[line_spacing]}
                                            onValueChange={(value) => setLineSpacing(value[0])}
                                            min={0.5}
                                            max={2.0}
                                            step={0.05}
                                            className="mt-2 touch-manipulation"
                                        />
                                    </div>
                                    <div className="space-y-2 bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                                        <label className="text-sm font-medium text-gray-700">
                                            Font Size (px): {font_size}
                                        </label>
                                        <Slider
                                            value={[font_size]}
                                            onValueChange={(value) => setFontSize(value[0])}
                                            min={0.5}
                                            max={2.0}
                                            step={0.1}
                                            className="mt-2 touch-manipulation"
                                        />
                                    </div>
                                    <div className="space-y-2 bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                                        <label className="text-sm font-medium text-gray-700">
                                            Text Alignment
                                        </label>
                                        <select
                                            value={text_align}
                                            onChange={(e) => setTextAlignment(e.target.value)}
                                            className="w-full p-2 border-2 rounded-md focus:border-blue-500 transition-colors text-base"
                                        >
                                            <option value="left">Left</option>
                                            <option value="center">Center</option>
                                            <option value="right">Right</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Generate Button */}
                            <div className="flex justify-center">
                                <Button
                                    onClick={generateHandwriting}
                                    disabled={loading}
                                    className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 sm:px-8 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 touch-manipulation"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        'Generate Handwriting'
                                    )}
                                </Button>
                            </div>

                            {/* Status Messages */}
                            {status && (
                                <div className={`p-3 sm:p-4 rounded-lg text-sm sm:text-base ${
                                    status.isError ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'
                                }`}>
                                    {status.message}
                                </div>
                            )}

                            {/* Preview Section */}
                            {svgContent && (
                                <div className="space-y-4">
                                    <div className="border-2 border-gray-200 rounded-lg p-4 sm:p-6 bg-white shadow-lg">
                                        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4">
                                            <h3 className="text-lg font-medium text-gray-800">Preview</h3>
                                            <Button
                                                variant="secondary"
                                                onClick={downloadSVG}
                                                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-colors touch-manipulation"
                                            >
                                                Download SVG
                                            </Button>
                                        </div>
                                        <div
                                            className="w-full bg-gray-50 p-3 sm:p-4 rounded-lg overflow-x-auto"
                                            dangerouslySetInnerHTML={{ __html: svgContent }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 