"use client";

import { useState } from "react";
import EventSearch from "./EventSearch";
import EventList from "./EventList";
import { timelineGroups } from "content/timeline";

export default function EventPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  
  // Get unique years from timeline data
  const years = Array.from(new Set(timelineGroups.map(group => 
    new Date(group.date).getFullYear()
  )));

  // Handler functions for search and filter
  const handleSearch = (term:string) => {
    setSearchTerm(term);
  };

  const handleYearFilter = (year:string) => {
    setSelectedYear(year);
  };

  return (
    <>
      <div className="relative max-w-3xl mb-12 sm:mb-16">
        <EventSearch 
          onSearch={handleSearch} 
          onYearFilter={handleYearFilter} 
          years={years}
        />
      </div>
      
      <EventList 
        searchTerm={searchTerm} 
        selectedYear={selectedYear}
      />
    </>
  );
}