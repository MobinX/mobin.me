"use client";

import Link from "next/link";
import moment from "moment";
import { timelineGroups } from "content/timeline";
import { useState, useEffect } from "react";

export default function EventList({ searchTerm, selectedYear }:{
  searchTerm: string;
  selectedYear: string;
}) {
  const [filteredGroups, setFilteredGroups] = useState(timelineGroups);

  // Filter events based on search term and selected year
  useEffect(() => {
    const filtered = timelineGroups.filter(group => {
      const matchesSearchTerm = searchTerm 
        ? group.data[0].title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          group!.data[0]!.content?.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      
      const matchesYear = selectedYear 
        ? new Date(group.date).getFullYear() === parseInt(selectedYear) 
        : true;
      
      return matchesSearchTerm && matchesYear;
    });

    setFilteredGroups(filtered);
  }, [searchTerm, selectedYear]);

  return (
    <div className="grid gap-6 md:gap-8 sm:grid-cols-2 mt-10">
      {filteredGroups.length > 0 ? (
        filteredGroups.map((group) => (
          <Link 
            href={`/event/${group.slug}`} 
            key={group.id}
            className="group"
          >
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 h-full hover:shadow-md transition-shadow duration-300">
              <div className="relative">
                <img 
                  className="rounded-t-lg w-full h-48 object-cover" 
                  src={group.data[0].imageUrl || `https://source.unsplash.com/random/800x600?sig=${group.id}`} 
                  alt={group.data[0].title} 
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                  <h3 className="text-white p-4 text-xl font-semibold w-full group-hover:text-blue-100 transition-colors duration-300">
                    {group.data[0].title}
                    {group.data[0].isLatest ? (
                      <span className="bg-blue-100 text-blue-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-blue-900 dark:text-blue-300 ms-3">
                        Latest
                      </span>
                    ):(
                      <span className="bg-blue-100 text-blue-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-blue-900 dark:text-blue-300 ms-3">
                        Proud
                      </span>
                    )}
                  </h3>
                </div>
              </div>
              <div className="p-5">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{group.data[0].subtitle}</p>
                <time className="block mb-4 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                  {moment(group.date).format("MMMM Do, YYYY")}
                </time>
                <p className="mb-4 text-base font-normal text-gray-700 dark:text-gray-400 line-clamp-3">
                  {group.data[0].content}
                </p>
                <div className="flex justify-end">
                  <span className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                    Read more
                    <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))
      ) : (
        <div className="col-span-2 text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">No events found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}