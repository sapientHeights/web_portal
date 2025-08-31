import { GraduationCap } from "lucide-react";

type Props = {
    title: string,
    info: string
}

export default function Header({title, info} : Props) {
    return (
        <div className="text-center mb-10 mt-20 md:mt-10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 mx-auto flex items-center justify-center shadow-lg mb-4">
                <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
            <p className="text-gray-500 mt-1">{info}</p>
        </div>
    )
}