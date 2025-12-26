"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface Props {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  suggestions: string[];
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  maxLength?: number;
}

export function AutocompleteInput({
  id,
  name,
  label,
  placeholder,
  suggestions,
  value: initialValue = "",
  onChange,
  required = false,
  maxLength = 100,
}: Props) {
  const [value, setValue] = useState(initialValue);
  const [isManuallyOpen, setIsManuallyOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync with parent value changes
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Derive filtered suggestions from value
  const filteredSuggestions = useMemo(() => {
    if (value.length >= 2) {
      return suggestions.filter((suggestion) =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
    }
    return [];
  }, [value, suggestions]);

  // Derive isOpen from filtered suggestions
  const isOpen =
    isManuallyOpen && filteredSuggestions.length > 0 && value.length >= 2;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsManuallyOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange?.(newValue);
    setHighlightedIndex(-1);
    setIsManuallyOpen(true);
  };

  const handleSelect = (suggestion: string) => {
    setValue(suggestion);
    onChange?.(suggestion);
    setIsManuallyOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (
          highlightedIndex >= 0 &&
          highlightedIndex < filteredSuggestions.length
        ) {
          handleSelect(filteredSuggestions[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsManuallyOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>
      <input
        ref={inputRef}
        type="text"
        id={id}
        name={name}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsManuallyOpen(true)}
        required={required}
        maxLength={maxLength}
        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        placeholder={placeholder}
        autoComplete="off"
      />

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSelect(suggestion)}
              className={`block w-full px-4 py-2 text-left text-sm ${
                index === highlightedIndex
                  ? "bg-blue-500 text-white"
                  : "text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Helper text */}
      {value.length > 0 && value.length < 2 && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Type at least 2 characters to see suggestions
        </p>
      )}
    </div>
  );
}
