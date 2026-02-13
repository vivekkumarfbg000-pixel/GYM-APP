'use client';

import { useState, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function QRCodeScanner() {
    const [scanning, setScanning] = useState(true);
    const [result, setResult] = useState<null | 'success' | 'invalid'>(null);
    const [scannedData, setScannedData] = useState<any>(null);

    // Simulate scanning process
    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (scanning) {
            timeout = setTimeout(() => {
                // Randomly success or fail for demo
                const isSuccess = Math.random() > 0.3;
                setScanning(false);
                setResult(isSuccess ? 'success' : 'invalid');

                if (isSuccess) {
                    setScannedData({
                        name: 'Deepak Verma',
                        id: 'MB-2024-001',
                        plan: 'Gold Membership',
                        status: 'Active',
                        checkInTime: new Date().toLocaleTimeString()
                    });
                    toast.success('Member Checked In!');
                } else {
                    toast.error('Invalid QR Code');
                }
            }, 3000);
        }
        return () => clearTimeout(timeout);
    }, [scanning]);

    const resetScan = () => {
        setResult(null);
        setScannedData(null);
        setScanning(true);
    };

    return (
        <div className="min-h-screen bg-black flex flex-col p-6">
            <div className="text-center mb-6 pt-4">
                <h1 className="text-white font-bold text-xl">Attendance Scanner</h1>
                <p className="text-zinc-400 text-sm">Align QR code within frame</p>
            </div>

            {/* Scanner Viewport */}
            <div className="flex-1 flex items-center justify-center relative">
                {scanning && (
                    <div className="relative w-64 h-64 border-2 border-blue-500/50 rounded-3xl overflow-hidden box-content p-1">
                        {/* Scanning Animation */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-scan-down"></div>

                        {/* Corner Markers */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl"></div>

                        <div className="w-full h-full bg-zinc-900/50 flex items-center justify-center backdrop-blur-sm">
                            <Camera className="text-zinc-700 w-12 h-12" />
                        </div>
                    </div>
                )}

                {!scanning && result === 'success' && (
                    <div className="bg-zinc-900 border border-green-500/30 p-6 rounded-3xl text-center w-full max-w-xs animate-in zoom-in-50 duration-300">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="text-green-500 w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-1">{scannedData.name}</h2>
                        <p className="text-zinc-400 text-sm mb-4">{scannedData.plan}</p>

                        <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-left mb-6">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-zinc-500">ID</span>
                                <span className="text-white font-mono">{scannedData.id}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Time</span>
                                <span className="text-white font-mono">{scannedData.checkInTime}</span>
                            </div>
                        </div>

                        <Button onClick={resetScan} className="w-full bg-green-600 hover:bg-green-700 text-white scan-button">
                            Scan Next
                        </Button>
                    </div>
                )}

                {!scanning && result === 'invalid' && (
                    <div className="bg-zinc-900 border border-red-500/30 p-6 rounded-3xl text-center w-full max-w-xs animate-in zoom-in-50 duration-300">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <XCircle className="text-red-500 w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Invalid Code</h2>
                        <p className="text-zinc-400 text-sm mb-6">QR code not recognized or member does not exist.</p>

                        <Button onClick={resetScan} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white">
                            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                        </Button>
                    </div>
                )}
            </div>

            <p className="text-center text-zinc-600 text-xs mt-6 mb-20">
                Powered by GymFlow AI Cam
            </p>
        </div>
    );
}
