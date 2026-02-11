'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Global Error caught:', error)
    }, [error])

    return (
        <html>
            <body className="bg-gray-50">
                <div className="flex h-screen w-full flex-col items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-red-100 text-center">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                            <AlertTriangle className="h-8 w-8 text-red-600" />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-2">System Overload!</h2>
                        <p className="text-gray-500 mb-6">
                            Something went wrong on our end. Don't worry, your reps still count.
                        </p>

                        <div className="p-4 bg-gray-50 rounded-lg mb-6 text-left overflow-hidden">
                            <p className="text-xs font-mono text-gray-600 break-all">
                                {error.message || 'Unknown error occurred'}
                            </p>
                            {error.digest && (
                                <p className="text-[10px] text-gray-400 mt-1">Digest: {error.digest}</p>
                            )}
                        </div>

                        <Button
                            onClick={() => reset()}
                            className="w-full bg-gray-900 hover:bg-black h-12 text-lg"
                        >
                            Try Again
                        </Button>
                    </div>
                </div>
            </body>
        </html>
    )
}
