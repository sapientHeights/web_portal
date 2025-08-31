type Props = {
    onClick: () => void;
    icon: React.ReactNode;
    text: string;
}

export default function Button({ onClick, icon, text }: Props) {
    return (
        <button
            onClick={onClick}
            className="flex justify-center items-center gap-1 top-5 left-5 bg-red-500 text-white font-semibold px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm hover:bg-red-600 transition-all cursor-pointer"
        >
            <span>{icon}</span>
            {text}
        </button>
    )
}