'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const { user, updateUserProfile } = useAuth();
    const router = useRouter();
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ message: string; isError: boolean } | null>(null);

    const handleUpdateProfile = async () => {
        setLoading(true);
        setStatus(null);
        try {
            await updateUserProfile({ displayName });
            setStatus({ message: "Profile updated successfully!", isError: false });
        } catch (error) {
            console.error("Error updating profile:", error);
            setStatus({ message: `Error updating profile: ${error instanceof Error ? error.message : 'Unknown error'}`, isError: true });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
            <div className="container mx-auto max-w-2xl px-4">
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
                        <CardTitle className="text-center text-2xl">User Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={user?.email || ''} disabled className="bg-gray-100" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="displayName">Display Name</Label>
                                <Input
                                    id="displayName"
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Enter your display name"
                                />
                            </div>
                            <Button onClick={handleUpdateProfile} disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white">
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update Profile'
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