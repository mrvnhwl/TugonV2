type Props = {
  label?: string;
  options: string[];
  multiple?: boolean;
  value: string | string[];
  onChange: (v: string | string[]) => void;
};

export default function MultipleChoiceAnswer({ label = "Choose one", options, multiple = false, value, onChange }: Props) {
  const isChecked = (opt: string) => (Array.isArray(value) ? value.includes(opt) : value === opt);
  const toggle = (opt: string) => {
    if (multiple) {
      const arr = Array.isArray(value) ? [...value] : [];
      const idx = arr.indexOf(opt);
      if (idx >= 0) arr.splice(idx, 1); else arr.push(opt);
      onChange(arr);
    } else {
      onChange(opt);
    }
  };

  return (
    <div>
      <div className="text-sm font-semibold text-gray-700 mb-3">{label}</div>
      <div className="grid gap-2">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-3 p-3 rounded-lg ring-1 ring-black/10 bg-white hover:bg-gray-50 cursor-pointer">
            <input
              type={multiple ? "checkbox" : "radio"}
              name="mcq"
              className="h-4 w-4"
              checked={isChecked(opt)}
              onChange={() => toggle(opt)}
            />
            <span className="text-gray-900">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
