import AboutPlaceholder from "components/skeleton/AboutPlaceholder";
import ArticlesPlaceholder from "components/skeleton/ArticlesPlaceholder";
import EducationsPlaceholder from "components/skeleton/EducationsPlaceholder";
import ExperiencesPlaceholder from "components/skeleton/ExperiencesPlaceholder";
import LifeEventsPlaceholder from "components/skeleton/LifeEventsPlaceholder";
import PublicationsPlaceholder from "components/skeleton/PublicationsPlaceholder";
import ProjectsPlaceholder from "components/skeleton/ProjectsPlaceholder";
import fs from "fs";
import { Suspense } from "react";
import generateRss from "utils/generate-rss";
import About from "./About";
import Server from "./Server";
import React from "react";
import { TimelineComponent } from "./TimeLine";

export default async function Home(): Promise<JSX.Element> {
  if (fs.existsSync("public")) {
    await generateRss();
  }

  return (
    <>
      <Suspense fallback={<AboutPlaceholder />}>
        {/* @ts-expect-error Server Component */}
        <About />
      </Suspense>

      {/* <Photos images={photos} /> */}

      <Suspense fallback={<EducationsPlaceholder />}>
        {/* @ts-expect-error Server Component */}
        <Server component="Educations" />
      </Suspense>

      <Suspense fallback={<ExperiencesPlaceholder />}>
        {/* @ts-expect-error Server Component */}
        <Server component="Experiences" />
      </Suspense>

      <Suspense>
        {/* @ts-expect-error Server Component */}
        <Server component="Skills" />
      </Suspense>

      <Suspense fallback={<PublicationsPlaceholder />}>
        {/* @ts-expect-error Server Component */}
        <Server component="Publications" />
      </Suspense>

      <Suspense fallback={<ProjectsPlaceholder />}>
        {/* @ts-expect-error Server Component */}
        <Server component="Projects" />
      </Suspense>

      {/* <Miscellaneous /> */}

      <TimelineComponent />

      <Suspense fallback={<ArticlesPlaceholder />}>
        {/* @ts-expect-error Server Component */}
        <Server component="Articles" />
      </Suspense>

      {/* <Calendar /> */}
    </>
  );
}
