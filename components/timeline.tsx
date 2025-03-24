import React from "react";
import moment from "moment";

interface TimelineItem {
    title: string;
    subtitle: string;
    date: string | Date;
    isLatest?: boolean;
    content?: string;
    imageUrl?: string; // Add optional image URL property
    link?: {
        text: string;
        url: string;
    };
}

interface TimelineGroup {
    date: string | Date;
    data: TimelineItem[];
}

export interface TimelineProps {
    timelineData: TimelineGroup[];
}

const Timeline: React.FC<TimelineProps> = ({ timelineData }) => {
    // Flatten the timeline data to have a single list of items
    const flattenedItems = timelineData.flatMap(group => 
        group.data.map(item => ({
            ...item,
            groupDate: group.date
        }))
    );

    return (
        <ol className="relative border-s border-gray-200 dark:border-gray-700 max-w-3xl flex  flex-col items-start">
            {flattenedItems.map((item, index) => (
                <li key={index} className={`mb-10 ms-6 ${index === flattenedItems.length - 1 ? 'mb-0' : ''}`}>
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -start-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
                        <svg className="w-2.5 h-2.5 text-blue-800 dark:text-blue-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
                        </svg>
                    </span>
                    <time className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                        {moment(item.date).format("MMMM Do, YYYY")}
                    </time>
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <div className="relative">
                            <img 
                                className="rounded-t-lg w-full h-48 object-cover" 
                                src={item.imageUrl || `https://source.unsplash.com/random/800x600?sig=${index}`} 
                                alt={item.title} 
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                                <h3 className="text-white p-4 text-xl font-semibold w-full">
                                    {item.title}
                                    {item.isLatest ? (
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
                            {item.content && (
                                <p className="mb-4 text-base font-normal text-gray-700 dark:text-gray-400">
                                    {item.content}
                                </p>
                            )}
                            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">{item.subtitle}</p>
                            {item.link && (
                                <a 
                                    href={item.link.url} 
                                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                >
                                    {item.link.text}
                                    <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                                    </svg>
                                </a>
                            )}
                        </div>
                    </div>
                </li>
            ))}
        </ol>
    );
};

export default Timeline;