"use client";
import { useState } from "react";
import { http } from "@/lib/api";

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    if (q.length < 3) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    try {
      const data = await http.get<any[]>(
        `/api/search?q=${encodeURIComponent(q)}`,
      );
      setResults(data || []);
      setShowDropdown((data || []).length > 0);
    } catch {
      setResults([]);
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        className="w-full p-1 text-xs rounded bg-white/20 text-white placeholder-white/70 focus:outline-none"
      />
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-700 text-black dark:text-white rounded shadow-lg mt-1 z-50 max-h-48 overflow-y-auto">
          {results.map((item, idx) => (
            <a
              key={idx}
              href={item.href}
              className="block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
              onClick={() => setShowDropdown(false)}
            >
              <span className="font-bold">{item.type}</span>: {item.title}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
