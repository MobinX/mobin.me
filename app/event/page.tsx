import SimpleLayout from "components/SimpleLayout";
import { server } from "config";
import type { Metadata } from "next";
import EventPage from "./EventPage";

export const metadata: Metadata = {
  title: "Events",
  description: "All my events and achievements that I'm proud of.",
  openGraph: {
    title: "Events - Md. Mobin Chowdhury",
    description: "All my events and achievements that I'm proud of.",
    url: `${server}/event`,
    type: "website",
    siteName: "Md. Mobin Chowdhury | Personal Website",
    images: [
      {
        url: `${server}/images/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Md. Mobin Chowdhury | Personal Website",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@mobincx",
    creator: "@mobincx",
    title: "Events - Md. Mobin Chowdhury",
    description: "All my events and achievements that I'm proud of.",
    images: [
      {
        url: `${server}/images/og-image.png`,
        alt: "Md. Mobin Chowdhury | Personal Website",
        width: 1200,
        height: 630,
      },
    ],
  },
  alternates: {
    canonical: `${server}/event`,
    types: {
      "application/rss+xml": `${server}/feed.xml`,
    },
  },
};

export default function EventsPage() {
  return (
    <SimpleLayout
      title="Events"
      intro="These are the notable events and achievements in my journey that I'm proud of."
    >
      <EventPage />
    </SimpleLayout>
  );
}