'use client';

import { BadgeX } from "lucide-react";

export default function NoDataSection() {
    return (
        <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10 mb-10">
            <div className="flex flex-col justify-center items-center gap-3">
                <p className="text-red-800">{<BadgeX size={34} />}</p>
                <p className="text-2xl font-mono">No Data Available</p>
            </div>
        </div>
    )
}