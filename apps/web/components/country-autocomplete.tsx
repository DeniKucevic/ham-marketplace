// components/country-autocomplete.tsx
"use client";

import { useMemo, useRef, useState } from "react";

const COUNTRIES = [
  "Serbia",
  "Croatia",
  "Bosnia and Herzegovina",
  "Slovenia",
  "North Macedonia",
  "Montenegro",
  "Germany",
  "Austria",
  "Switzerland",
  "Italy",
  "Hungary",
  "Romania",
  "Bulgaria",
  "Greece",
  "Poland",
  "Czech Republic",
  "Slovakia",
  "Ukraine",
  "France",
  "Spain",
  "United Kingdom",
  "Netherlands",
  "Belgium",
  "Denmark",
  "Sweden",
  "Norway",
  "Finland",
  "Portugal",
  "Ireland",
  "Turkey",
];

interface Props {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}

export function CountryAutocomplete({
  value,
  onChange,
  required,
  placeholder = "Serbia",
}: Props) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ✅ Use useMemo instead of useEffect + useState
  const filteredCountries = useMemo(() => {
    if (value.length >= 1) {
      return COUNTRIES.filter((country) =>
        country.toLowerCase().includes(value.toLowerCase())
      );
    }
    return [];
  }, [value]);

  const handleSelect = (country: string) => {
    onChange(country);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleFocus = () => {
    if (value.length >= 1 && filteredCountries.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    if (e.target.value.length >= 1) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        required={required}
        placeholder={placeholder}
        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      />

      {showSuggestions && filteredCountries.length > 0 && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg dark:bg-gray-700">
          {filteredCountries.map((country) => (
            <button
              key={country}
              type="button"
              onClick={() => handleSelect(country)}
              className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-white"
            >
              {country}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
