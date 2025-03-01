export function Select({ children, value, onChange }) {
    return (
      <select value={value} onChange={onChange} className="border p-2 rounded">
        {children}
      </select>
    );
  }
  
  export function SelectItem({ children, value }) {
    return <option value={value}>{children}</option>;
  }
  