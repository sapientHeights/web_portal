type Props = {
    label: string;
    name: string;
    value: string;
    onChange: React.ChangeEventHandler;
    required?: boolean;
    maxLength?: number;
}

export default function TextAreaField({ label, name, value, onChange, required, maxLength }: Props) {
    return (
        <div>
            <label className="block text-sm font-bold tracking-wide text-gray-700 mb-1">{label}</label>
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                rows={3}
                maxLength={maxLength}
                className="w-full border border-gray-300 rounded bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
        </div>
    )
}