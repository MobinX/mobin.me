import { ImageIcon } from "components/Icons";

export default function ProjectsPlaceholder() {
  return (
    <section className="py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-5 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 gap-x-12 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
            <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
            <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    </section>
  );
}
