type Props = {
    name: string,
    role: string
}

export default function UserInfo({name, role} : Props ) {
    return (
        <div className="absolute top-5 right-5 bg-white/90 backdrop-blur-sm border border-white/30 shadow-md px-5 py-3 rounded-full flex items-center gap-3 text-sm md:text-base">
            <div className="w-9 h-9 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center">
                {name.charAt(0).toUpperCase()}
            </div>
            <div>
                <div className="font-semibold text-gray-800">{name}</div>
                <div className="text-gray-500 text-xs">{role}</div>
            </div>
        </div>
    )
}