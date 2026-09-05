type Props = {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
};

export default function SingleLineAnswer({ label = "Answer", placeholder, value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <input
        type="text"
        className="w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent px-3 py-2 text-gray-900"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? label}
      />
    </div>
  );
}
