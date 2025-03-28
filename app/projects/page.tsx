import SimpleLayout from "components/SimpleLayout";
import ProjectsPlaceholder from "components/skeleton/ProjectsPlaceholder";
import { server } from "config";
import type { Metadata } from "next";
import { Suspense } from "react";
import ListProjects from "./ListProjects";
import { MySelfScript } from "components/schema";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "I’ve worked on tons of little projects over the years but these are the ones that I’m most proud of. Many of them are open-source, so if you see something that piques your interest, check out the code and contribute if you have ideas for how it can be improved.",
  openGraph: {
    title: "Projects - Md. Mobin Chowdhury",
    description:
      "I’ve worked on tons of little projects over the years but these are the ones that I’m most proud of. Many of them are open-source, so if you see something that piques your interest, check out the code and contribute if you have ideas for how it can be improved.",
    url: `${server}/projects`,
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
    title: "Projects - Md. Mobin Chowdhury",
    description:
      "I’ve worked on tons of little projects over the years but these are the ones that I’m most proud of. Many of them are open-source, so if you see something that piques your interest, check out the code and contribute if you have ideas for how it can be improved.",
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
    canonical: `${server}/projects`,
    types: {
      "application/rss+xml": `${server}/feed.xml`,
    },
  },
};

export default function Projects(): JSX.Element {
  return (
    <SimpleLayout
      title="Things I’ve made trying to put my dent in the universe."
      intro="I’ve worked on tons of little projects over the years but these are the ones that I’m most proud of. Many of them are open-source, so if you see something that piques your interest, check out the code and contribute if you have ideas for how it can be improved."
    >
      <MySelfScript />
      <div className="mt-16 sm:mt-20">
        <Suspense fallback={<ProjectsPlaceholder />}>
          {/* @ts-expect-error Server Component */}
          <ListProjects />
        </Suspense>
      </div>
    </SimpleLayout>
  );
}
