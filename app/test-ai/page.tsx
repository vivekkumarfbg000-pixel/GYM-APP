'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, Sparkles } from 'lucide-react';

export default function TestAIPage() {
    const [testing, setTesting] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const testGeminiAPI = async () => {
        setTesting(true);
        setResult(null);
        setError(null);

        try {
            const memberId = localStorage.getItem('gymflow_member_id') || 'test-member-id';

            const response = await fetch('/api/ai/generate-post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ triggerMemberId: memberId })
            });

            const data = await response.json();

            if (data.error) {
                setError(data.error);
            } else {
                setResult(data);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to test Gemini API');
        } finally {
            setTesting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-3xl shadow-2xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mb-4">
                            <Sparkles className="text-white" size={32} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gemini AI Test</h1>
                        <p className="text-gray-500">Test if Gemini API is properly configured</p>
                    </div>

                    {/* Test Button */}
                    <div className="flex justify-center mb-8">
                        <Button
                            onClick={testGeminiAPI}
                            disabled={testing}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-6 rounded-2xl text-lg font-bold shadow-lg hover:shadow-xl transition-all"
                            size="lg"
                        >
                            {testing ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={20} />
                                    Testing Gemini API...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2" size={20} />
                                    Test AI Post Generation
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Results */}
                    {result && (
                        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={24} />
                                <div className="flex-1">
                                    <h3 className="font-bold text-green-900 mb-2 text-lg">✅ Gemini API is Working!</h3>
                                    <div className="bg-white rounded-xl p-4 border border-green-200">
                                        <p className="text-sm text-gray-500 font-medium mb-2">Generated Content:</p>
                                        <p className="text-gray-900 font-medium leading-relaxed">
                                            {result.data?.content || 'AI response generated successfully'}
                                        </p>
                                    </div>
                                    <div className="mt-3 text-xs text-green-700 font-mono bg-green-100 p-2 rounded">
                                        Post ID: {result.data?.id}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-start gap-3">
                                <XCircle className="text-red-600 flex-shrink-0 mt-1" size={24} />
                                <div className="flex-1">
                                    <h3 className="font-bold text-red-900 mb-2 text-lg">❌ API Error</h3>
                                    <p className="text-red-700 font-mono text-sm bg-red-100 p-3 rounded-lg break-all">
                                        {error}
                                    </p>
                                    <div className="mt-4 text-sm text-red-800">
                                        <p className="font-bold mb-2">Troubleshooting:</p>
                                        <ul className="list-disc list-inside space-y-1 text-xs">
                                            <li>Check if <code className="bg-red-200 px-1 rounded">GEMINI_API_KEY</code> is set in <code className="bg-red-200 px-1 rounded">.env.local</code></li>
                                            <li>Verify your Google AI Studio API key is valid</li>
                                            <li>Ensure the API key has proper permissions</li>
                                            <li>Restart your development server after adding the key</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* API Key Status */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <h4 className="font-bold text-gray-700 mb-2 text-sm">Environment Setup:</h4>
                        <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">API Endpoint:</span>
                                <code className="bg-gray-200 px-2 py-1 rounded font-mono">/api/ai/generate-post</code>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Expected Env Var:</span>
                                <code className="bg-gray-200 px-2 py-1 rounded font-mono">GEMINI_API_KEY</code>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Model:</span>
                                <code className="bg-gray-200 px-2 py-1 rounded font-mono">gemini-2.0-flash-exp</code>
                            </div>
                        </div>
                    </div>

                    {/* Additional Tests */}
                    <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                        <p className="text-sm text-indigo-900 font-medium">
                            💡 <strong>Tip:</strong> After confirming the API works, check the Community Feed to see the AI-generated motivational post!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
