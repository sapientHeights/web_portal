type Props = {
    label: string;
    name: string;
    options: string[];
    value: string;
    onChange: React.ChangeEventHandler;
    required?: boolean;
}

export default function RadioGroup({ label, name, options, value, onChange, required }: Props) {
    return (
        <div>
            <label className="block text-sm font-bold text-gray-700 tracking-wide mb-1">{label}</label>
            <div className="flex gap-4">
                {options.map(opt => (
                    <label key={opt} className="inline-flex items-center space-x-2 text-sm tracking-wide">
                        <input
                            type="radio"
                            name={name}
                            value={opt}
                            checked={value === opt}
                            onChange={onChange}
                            required={required}
                            className="text-purple-600"
                        />
                        <span className="capitalize">{opt}</span>
                    </label>
                ))}
            </div>
        </div>
    )
}