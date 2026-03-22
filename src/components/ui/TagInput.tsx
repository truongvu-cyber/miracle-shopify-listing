import { useState, useRef, type KeyboardEvent } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  label?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  error?: string;
}

export function TagInput({
  label,
  tags,
  onChange,
  placeholder = "Type and press Enter...",
  error,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function addTags(raw: string) {
    const newTags = raw
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0 && !tags.includes(t));

    if (newTags.length > 0) {
      onChange([...tags, ...newTags]);
    }
    setInputValue("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputValue.trim()) {
        addTags(inputValue);
      }
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    if (pasted) {
      addTags(pasted);
    }
  }

  function removeTag(index: number) {
    onChange(tags.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[var(--text-secondary)]">{label}</label>
      )}
      <div
        className={`
          flex flex-wrap gap-1.5 p-2 min-h-[42px] rounded-lg border bg-[var(--bg-input)]
          transition-colors duration-150 cursor-text
          focus-within:ring-2 focus-within:ring-[var(--ring)] focus-within:border-[var(--border-focus)]
          ${error ? "border-[var(--danger)]" : "border-[var(--border)] hover:border-[var(--border-hover)]"}
        `}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            className="
              inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium
              bg-[var(--brand-muted)] text-[var(--brand)] border border-[var(--brand)]/30
              transition-colors hover:bg-[var(--brand-muted)]
            "
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(i);
              }}
              className="p-0.5 rounded hover:bg-[var(--brand)]/20 transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={() => {
            if (inputValue.trim()) {
              addTags(inputValue);
            }
          }}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] text-sm outline-none bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
        />
      </div>
      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
    </div>
  );
}
