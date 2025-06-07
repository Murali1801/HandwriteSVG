'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const [loading, setLoading] = useState(false); // Example loading state
    const [status, setStatus] = useState<{ message: string; isError: boolean } | null>(null);

    const handleThemeToggle = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
        setStatus({ message: `Theme changed to ${theme === 'dark' ? 'light' : 'dark'}.`, isError: false });
    };

    // Example of a placeholder save settings function
    const handleSaveSettings = async () => {
        setLoading(true);
        setStatus(null);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setStatus({ message: "Settings saved successfully!", isError: false });
        } catch (error) {
            console.error("Error saving settings:", error);
            setStatus({ message: `Error saving settings: ${error instanceof Error ? error.message : 'Unknown error'}`, isError: true });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
            <div className="container mx-auto max-w-2xl px-4">
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
                        <CardTitle className="text-center text-2xl">Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="dark-mode">Dark Mode</Label>
                                <Switch
                                    id="dark-mode"
                                    checked={theme === 'dark'}
                                    onCheckedChange={handleThemeToggle}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notifications">Notifications</Label>
                                {/* Placeholder for notification settings */}
                                <div className="text-sm text-gray-500">More notification options coming soon!</div>
                            </div>

                            <Button onClick={handleSaveSettings} disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white">
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Settings'
                                )}
                            </Button>
                            {status && (
                                <div className={`p-3 rounded-md ${
                                    status.isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                }`}>
                                    {status.message}
                                </div>
                            )}
                            <Button variant="outline" onClick={() => router.back()} className="w-full">
                                Back
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 