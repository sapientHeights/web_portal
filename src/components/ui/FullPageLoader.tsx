'use client';

import { Loader } from "lucide-react"

export default function FullPageLoader() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader className="animate-spin text-black text-9xl" />
        </div>
    )
}