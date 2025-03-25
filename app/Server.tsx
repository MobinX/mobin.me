import { BibtexParser } from "bibtex-js-parser";
import { server } from "config";
import { allArticles } from "contentlayer/generated";
import fs, { promises as ps } from "fs";
import Articles from "./Articles";
import Educations from "./Educations";
import Experiences from "./Experiences";
import LifeEvents from "./LifeEvents";
import Publications from "./Publications";
import Projects from "./Projects";
import Skills from "./Skills";

// get educations from the local file
async function getEducations(): Promise<any> {
  if (fs.existsSync("public/content/educations.json")) {
    const res = await ps.readFile("public/content/educations.json", "utf-8");
    const educations: Education[] = JSON.parse(res);
    return educations;
  }

  const educations = fetch(`${server}/content/educations.json`)
    .then((response) => response.json())
    .then((data) => {
      return data;
    });

  return educations;
}

// get experiences from the local file
async function getExperiences(): Promise<any> {
  if (fs.existsSync("public/content/experiences.json")) {
    const res = await ps.readFile("public/content/experiences.json", "utf-8");
    const experiences: Experience[] = JSON.parse(res);
    return experiences;
  }

  const experiences = fetch(`${server}/content/experiences.json`)
    .then((response) => response.json())
    .then((data) => {
      return data;
    });

  return experiences;
}

// get publications from the local bibliography file
async function getPublications(): Promise<any> {
  if (fs.existsSync("public/content/publications.json")) {
    const res = await ps.readFile("public/content/publications.json", "utf-8");
    const publications: any = JSON.parse(res);
    return publications;
  }

  const publications = fetch(`${server}/content/publications.json`)
    .then((response) => response.json())
    .then((data) => {
      return data;
    });

  return publications;
}
// get life events from the local file
async function getLifeEvents(): Promise<any> {
  if (fs.existsSync("public/content/life_events.json")) {
    const res = await ps.readFile("public/content/life_events.json", "utf-8");
    const lifeEvents: any = JSON.parse(res);
    return lifeEvents;
  }

  const lifeEvents = fetch(`${server}/content/life_events.json`)
    .then((response) => response.json())
    .then((data) => {
      return data;
    });

  return lifeEvents;
}

// get projects from the local file
async function getProjects(): Promise<any> {
  if (fs.existsSync("public/content/projects.json")) {
    const res = await ps.readFile("public/content/projects.json", "utf-8");
    const projects: Project[] = JSON.parse(res);
    return projects.slice(0, 3); // Return only top 3 projects
  }

  const projects = fetch(`${server}/content/projects.json`)
    .then((response) => response.json())
    .then((data) => {
      return data.slice(0, 3);
    });

  return projects;
}

// get skills from the local file
async function getSkills(): Promise<any> {
  if (fs.existsSync("public/content/skills.json")) {
    const res = await ps.readFile("public/content/skills.json", "utf-8");
    const skills: any = JSON.parse(res);
    return skills;
  }
  const skills = fetch(`${server}/content/skills.json`)
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
  return skills;
}

// get sorted articles from the contentlayer
async function getSortedArticles(): Promise<any> {
  let articles = await allArticles;
  articles = articles.filter((article: any) => article.status === "published");
  return articles.sort((a: any, b: any) => {
    if (a.publishedAt && b.publishedAt) {
      return (
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    }
    return 0;
  });
}

export default async function Server({
  component,
}: {
  component: string;
}): Promise<JSX.Element> {
  switch (component) {
    case "Educations":
      return <Educations educations={await getEducations()} />;
    case "Experiences":
      return <Experiences experiences={await getExperiences()} />;
    case "Publications":
      return <Publications publications={await getPublications()} />;
    case "Articles":
      return <Articles articles={await getSortedArticles()} />;
    case "LifeEvents":
      return <LifeEvents lifeEvents={await getLifeEvents()} />;
    case "Projects":
      return <Projects />;
    case "Skills":
      return <Skills skills={await getSkills()} />;
    default:
      return <></>;
  }
}
