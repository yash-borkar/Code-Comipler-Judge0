export function Textarea({ value, onChange, placeholder, rows, readOnly }) {
    return (
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        readOnly={readOnly}
        className="border p-2 w-full rounded"
      />
    );
  }
  