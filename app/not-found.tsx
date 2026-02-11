import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Dumbbell } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 text-center px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                    <Dumbbell className="h-8 w-8 text-blue-600" />
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h2>
                <p className="text-gray-500 mb-8">
                    Looks like this workout station is occupied or doesn't exist. Let's get you back to the gym floor.
                </p>

                <div className="flex flex-col gap-3">
                    <Link href="/dashboard" className="w-full">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg">
                            Go to Dashboard
                        </Button>
                    </Link>
                    <Link href="/mobile/home" className="w-full">
                        <Button variant="outline" className="w-full h-12 text-lg">
                            Mobile App Home
                        </Button>
                    </Link>
                </div>
            </div>

            <p className="mt-8 text-sm text-gray-400">
                Error 404 • GymFlow AI
            </p>
        </div>
    )
}
