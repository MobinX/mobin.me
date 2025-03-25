import { Container } from "components/Container";
import { timelineGroups } from "content/timeline";
import { server } from "config";
import moment from "moment";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: {
    slug: string;
  };
}

// Generate metadata for the page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = timelineGroups.find(group => group.slug === params.slug);
  
  if (!event) {
    return {
      title: "Event Not Found",
    };
  }

  return {
    title: `${event.data[0].title} | Events`,
    description: event.data[0].content,
    openGraph: {
      title: `${event.data[0].title} | Events - Md. Mobin Chowdhury`,
      description: event.data[0].content,
      url: `${server}/events/${params.slug}`,
      type: "article",
      siteName: "Md. Mobin Chowdhury | Personal Website",
      images: [
        {
          url: event.data[0].imageUrl || `${server}/images/og-image.png`,
          width: 1200,
          height: 630,
          alt: event.data[0].title,
        },
      ],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      site: "@mobincx",
      creator: "@mobincx",
      title: `${event.data[0].title} | Events - Md. Mobin Chowdhury`,
      description: event.data[0].content,
      images: [
        {
          url: event.data[0].imageUrl || `${server}/images/og-image.png`,
          alt: event.data[0].title,
          width: 1200,
          height: 630,
        },
      ],
    },
    alternates: {
      canonical: `${server}/events/${params.slug}`,
      types: {
        "application/rss+xml": `${server}/feed.xml`,
      },
    },
  };
}

export default function EventPage({ params }: Props) {
  const event = timelineGroups.find(group => group.slug === params.slug);
  
  if (!event) {
    return notFound();
  }

  const eventData = event.data[0];

  return (
    <Container className="mt-16 lg:mt-32">
      <div className="xl:relative">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/event"
            className="group mb-8 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 transition dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0 dark:ring-white/10 dark:hover:border-zinc-700 dark:hover:ring-white/20 lg:absolute lg:-left-5 lg:mb-0 lg:-mt-2 xl:-top-1.5 xl:left-0 xl:mt-0"
          >
            <svg
              className="h-4 w-4 stroke-zinc-500 transition group-hover:stroke-zinc-700 dark:stroke-zinc-500 dark:group-hover:stroke-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </Link>

          <article>
            <header className="flex flex-col">
              <h1 className="mt-6 text-3xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-4xl">
                {eventData.title}
              </h1>

              <time
                dateTime={moment(event.date).format("YYYY-MM-DD")}
                className="order-first flex items-center text-base text-zinc-400 dark:text-zinc-500 mt-4"
              >
                <span className="h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500" />
                <span className="ml-3">
                  {moment(event.date).format("MMMM Do, YYYY")}
                </span>
              </time>
              
              <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
                {eventData.subtitle}
              </p>
            </header>

            <div className="mt-8">
              <img
                src={eventData.imageUrl || `https://source.unsplash.com/random/1200x600?sig=${event.id}`}
                alt={eventData.title}
                className="w-full h-[400px] object-cover rounded-xl"
              />
            </div>

            <div className="mt-8 prose dark:prose-invert text-justify">
              <p className="text-zinc-600 dark:text-zinc-400">{eventData.content}</p>
              
              {/* Additional content if available */}
              {eventData.link && (
                <div className="mt-6">
                  <a 
                    href={eventData.link.url}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  >
                    {eventData.link.text}
                  </a>
                </div>
              )}
            </div>

            {/* Navigation between events */}
            <div className="mt-12 border-t border-zinc-100 pt-8 dark:border-zinc-700/40">
              <div className="flex justify-between gap-4">
                {getPreviousEvent(event) && (
                  <Link
                    href={`/events/${getPreviousEvent(event)?.slug}`}
                    className="flex items-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                  >
                    <svg
                      className="mr-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Previous Event
                  </Link>
                )}
                
                {getNextEvent(event) && (
                  <Link
                    href={`/events/${getNextEvent(event)?.slug}`}
                    className="flex items-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 ml-auto"
                  >
                    Next Event
                    <svg
                      className="ml-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          </article>
        </div>
      </div>
    </Container>
  );
}

// Helper function to get the previous event
function getPreviousEvent(currentEvent:any) {
  const currentIndex = timelineGroups.findIndex(group => group.id === currentEvent.id);
  return currentIndex < timelineGroups.length - 1 ? timelineGroups[currentIndex + 1] : null;
}

// Helper function to get the next event
function getNextEvent(currentEvent:any) {
  const currentIndex = timelineGroups.findIndex(group => group.id === currentEvent.id);
  return currentIndex > 0 ? timelineGroups[currentIndex - 1] : null;
}