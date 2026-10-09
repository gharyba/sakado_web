import type { InputHTMLAttributes } from "react";
export function Field({
  label,
  name,
  value = "",
  type = "text",
  required = false,
  ...props
}: {
  label: string;
  name: string;
  value?: string | number | null;
  type?: string;
  required?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "defaultValue" | "value">) {
  return (
    <label className="admin-field">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={value ?? ""}
        required={required}
        {...props}
      />
    </label>
  );
}
export function Area({
  label,
  name,
  value = "",
  rows = 4,
}: {
  label: string;
  name: string;
  value?: string | null;
  rows?: number;
}) {
  return (
    <label className="admin-field">
      {label}
      <textarea name={name} defaultValue={value ?? ""} rows={rows} />
    </label>
  );
}
export function Select({
  label,
  name,
  value = "",
  options,
}: {
  label: string;
  name: string;
  value?: string | null;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="admin-field">
      {label}
      <select name={name} defaultValue={value ?? ""}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
export function Check({
  label,
  name,
  checked = false,
}: {
  label: string;
  name: string;
  checked?: boolean;
}) {
  return (
    <label className="admin-check">
      <input type="checkbox" name={name} defaultChecked={checked} />
      {label}
    </label>
  );
}
export function Hidden({
  name,
  value,
}: {
  name: string;
  value: string | number;
}) {
  return <input type="hidden" name={name} value={value} />;
}
export function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="admin-panel">
      <h2>{title}</h2>
      <div className="admin-fields">{children}</div>
    </section>
  );
}
export function options(labels: Record<string, string>) {
  return Object.entries(labels).map(([value, label]) => ({ value, label }));
}
export function dateInput(date: Date | null | undefined) {
  return date
    ? new Date(date.getTime() + 3600000).toISOString().slice(0, 16)
    : "";
}
