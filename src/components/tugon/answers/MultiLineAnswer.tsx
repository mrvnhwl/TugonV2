type Props = {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
};

export default function MultiLineAnswer({ label = "Answer", placeholder, value, onChange, rows = 5 }: Props) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <textarea
        className="w-full min-h-32 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent px-3 py-2 text-gray-900 resize-y"
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? label}
      />
    </div>
  );
}
