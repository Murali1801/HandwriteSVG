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
    const [style, setStyle] = useState(9);
    const [bias, setBias] = useState(0.75);
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
                    bias
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
        <div className="container mx-auto max-w-3xl p-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-center">Handwriting Generator</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="text" className="text-sm font-medium">
                                Enter Text:
                            </label>
                            <Textarea
                                id="text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Type or paste your text here..."
                                rows={4}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Style (1-10): {style}
                                </label>
                                <Slider
                                    value={[style]}
                                    onValueChange={(value) => setStyle(value[0])}
                                    min={1}
                                    max={10}
                                    step={1}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Bias (0.1-1.0): {bias}
                                </label>
                                <Slider
                                    value={[bias]}
                                    onValueChange={(value) => setBias(value[0])}
                                    min={0.1}
                                    max={1.0}
                                    step={0.05}
                                />
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <Button
                                onClick={generateHandwriting}
                                disabled={loading}
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

                        {status && (
                            <div className={`p-3 rounded-md ${
                                status.isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                            }`}>
                                {status.message}
                            </div>
                        )}

                        {svgContent && (
                            <div className="space-y-4">
                                <div className="border rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-medium">Preview</h3>
                                        <Button
                                            variant="secondary"
                                            onClick={downloadSVG}
                                        >
                                            Download SVG
                                        </Button>
                                    </div>
                                    <div
                                        className="w-full"
                                        dangerouslySetInnerHTML={{ __html: svgContent }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 