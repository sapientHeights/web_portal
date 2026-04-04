type Props = {
    onClick: () => void;
    icon: React.ReactNode;
    text: string;
    setGreen?: boolean;
    type?: "button" | "submit" | "reset";
}

export default function Button({ onClick, icon, text, setGreen = false, type="submit" }: Props) {
    const style = setGreen ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600';

    return (
        <button
            type={type}
            onClick={onClick}
            className={`flex justify-center items-center gap-1 top-5 left-5 ${style} text-white font-semibold px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm transition-all cursor-pointer`}
        >
            <span>{icon}</span>
            {text}
        </button>
    )
}