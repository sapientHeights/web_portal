type Props = {
    primaryLabel: string;
    reset?: () => void;
}

export default function FormFooterActions({ primaryLabel, reset }: Props) {
    return (
        <div className="mt-10 flex justify-center flex-col sm:flex-row gap-4">
            <button
                type="submit"
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-xl transition-all cursor-pointer"
            >
                {primaryLabel}
            </button>
            {reset && (
                <button
                    type="button"
                    onClick={reset}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold transition-all cursor-pointer"
                >
                    Reset
                </button>
            )}
            <button
                type="button"
                onClick={() => window.history.back()}
                className="bg-red-400 hover:bg-red-500 text-white px-8 py-3 rounded-lg font-semibold transition-all cursor-pointer"
            >
                Cancel
            </button>
        </div>
    )
}