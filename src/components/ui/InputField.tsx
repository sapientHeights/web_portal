type Props = {
    label: string;
    name: string;
    value: string;
    onChange: React.ChangeEventHandler;
    type?: string;
    required?: boolean;
    maxLength?: number;
    minLength?: number;
    disabled?: boolean;
}

export default function InputField({ label, name, value, onChange, type = "text", required, maxLength, minLength, disabled }: Props) {
    return (
        <div>
            <label className="block text-sm font-bold tracking-wide text-gray-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
            <input
                type={type}
                name={name}
                value={value === undefined ? '' : value}
                onChange={onChange}
                required={required}
                maxLength={maxLength}
                minLength={minLength}
                disabled={disabled}
                className="w-full border border-gray-300 rounded-md bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
        </div>
    )
}