"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api-client"
import { Loader2 } from "lucide-react"

export default function DemoPage() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let mounted = true;
        const startDemo = async () => {
            try {
                const response = await api.post<any>('/auth/demo-login')
                if (response.success && mounted) {
                    sessionStorage.setItem('participantId', response.participantId)
                    sessionStorage.setItem('prolificPid', response.email)
                    router.push('/')
                }
            } catch (err: any) {
                console.error(err)
                if (mounted) {
                    setError(err.message || "Failed to start demo version")
                }
            }
        }
        startDemo()
        return () => { mounted = false; }
    }, [router])

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-900 p-4">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-2">Error</h2>
                    <p>{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            <p className="text-gray-700 font-medium text-lg">Starting Demo Mode...</p>
            <p className="text-gray-500 text-sm max-w-md text-center">
                Preparing a safe environment where data will not corrupt the main dataset.
            </p>
        </div>
    )
}
