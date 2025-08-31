type Props = {
    label: string;
    name: string;
    value: string;
    onChange: React.ChangeEventHandler;
    options: string[];
    required?: boolean;
    disabled?: boolean;
}

export default function SelectField({ label, name, value, onChange, options, required, disabled = false }: Props) {
    return (
        <div>
            <label className="block text-sm font-bold tracking-wide text-gray-700 mb-1">{label}</label>
            <select
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                disabled={disabled}
                className={`w-full border border-gray-300 ${disabled ? 'bg-gray-200 cursor-not-allowed' : 'bg-white' } text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500`}
            >
                <option value="">-- Select --</option>
                {options.map((opt, index) => (
                    <option key={index} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
        </div>
    )
}