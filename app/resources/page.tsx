import SimpleLayout from "components/SimpleLayout";
import ResourcesPlaceholder from "components/skeleton/ResourcesPlaceholder";
import { server } from "config";
import type { Metadata } from "next";
import { Suspense } from "react";
import ListResources from "./ListResources";
import { MySelfScript } from "components/schema";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "These materials have been tremendously beneficial to me in my learning path. I hope you find these helpful as well!",
  openGraph: {
    title: "Resources - Md. Mobin Chowdhury",
    description:
      "These materials have been tremendously beneficial to me in my learning path. I hope you find these helpful as well!",
    url: `${server}/resources`,
    type: "website",
    site_name: "Md. Mobin Chowdhury | Personal Website",
    images: [
      {
        url: `${server}/images/og-image.png`,
        alt: "Md. Mobin Chowdhury",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@mobincx",
    creator: "@mobincx",
    title: "Resources - Md. Mobin Chowdhury",
    description:
      "These materials have been tremendously beneficial to me in my learning path. I hope you find these helpful as well!",
    images: [
      {
        url: `${server}/images/og-image.png`,
        alt: "Md. Mobin Chowdhury",
        width: 1200,
        height: 630,
      },
    ],
  },
  alternates: {
    canonical: `${server}/resources`,
    types: {
      "application/rss+xml": `${server}/feed.xml`,
    },
  },
};

export default function Resources(): JSX.Element {
  return (
    <SimpleLayout
      title="Some excellent resources worth sharing"
      intro="These materials have been tremendously beneficial to me in my learning path. I hope you find these helpful as well!"
    >
      <MySelfScript />
      <div className="mt-16 sm:mt-20">
        <Suspense fallback={<ResourcesPlaceholder />}>
          {/* @ts-expect-error Server Component */}
          <ListResources />
        </Suspense>
      </div>
    </SimpleLayout>
  );
}
