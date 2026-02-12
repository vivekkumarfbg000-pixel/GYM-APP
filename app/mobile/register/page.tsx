'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, AlertCircle } from 'lucide-react';

export default function MobileRegisterPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <ShieldAlert className="w-10 h-10 text-white" />
                    </div>
                    <CardTitle className="text-2xl">Registration Disabled</CardTitle>
                    <CardDescription className="text-base">
                        Member registration is managed by gym owners
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-blue-900">
                                    How to Get Access
                                </p>
                                <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
                                    <li>Visit your gym in person</li>
                                    <li>Ask the gym owner to create your member account</li>
                                    <li>Receive your login credentials (email + password)</li>
                                    <li>Use those credentials to login to the app</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-sm text-gray-700 text-center">
                            <strong>Already have credentials?</strong>
                            <br />
                            Login with the email and password provided by your gym owner
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Button
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            asChild
                        >
                            <Link href="/mobile/login">
                                Go to Login
                            </Link>
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full"
                            asChild
                        >
                            <Link href="/">
                                Back to Home
                            </Link>
                        </Button>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                        <p className="text-xs text-center text-gray-500">
                            💡 <strong>Why this change?</strong> Gym-owner managed registration ensures better security and member verification.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
