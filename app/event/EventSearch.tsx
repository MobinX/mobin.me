"use client";

import { useState } from "react";

export default function EventSearch({ onSearch, onYearFilter, years }:{
  onSearch: (searchTerm: string) => void;
  onYearFilter: (year: string) => void;
  years: number[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const handleSearchChange = (e:any) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleYearChange = (e:any) => {
    const value = e.target.value;
    setSelectedYear(value);
    onYearFilter(value);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      <input
        aria-label="Search events"
        type="text"
        placeholder="Search events"
        className="block w-full px-4 py-2 text-gray-900 bg-white border border-gray-200 rounded-md dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800/90 dark:text-zinc-400"
        value={searchTerm}
        onChange={handleSearchChange}
      />
      
      <select 
        className="block w-full md:w-auto px-4 py-2 text-gray-900 bg-white border border-gray-200 rounded-md dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800/90 dark:text-zinc-400"
        value={selectedYear}
        onChange={handleYearChange}
      >
        <option value="">All Years</option>
        {years && years.sort((a, b) => b - a).map(year => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>
    </div>
  );
}