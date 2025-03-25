import ProjectCard from "components/ProjectCard";
import Link from "next/link";
import { server } from "config";
import fs, { promises as ps } from "fs";
import { Container } from "components/Container";
import { ChevronDownIcon } from "components/Icons";

// get top projects from local file
async function getTopProjects(): Promise<Project[]> {
    if (fs.existsSync("public/content/projects.json")) {
        const res = await ps.readFile("public/content/projects.json", "utf-8");
        const projects: Project[] = JSON.parse(res);
        // Return only the top 3 projects
        return projects.slice(0, 3);
    }

    const projects = fetch(`${server}/content/projects.json`)
        .then((response) => response.json())
        .then((data) => {
            return data.slice(0, 3);
        });

    return projects;
}

export default async function Projects(): Promise<JSX.Element> {
    const projects: Project[] = await getTopProjects();

    return (
        <Container className="mt-9" id="publications">

            <div className="max-w-3xl">
                <h3 className="font-bold text-2xl md:text-4xl tracking-tight mb-6 text-zinc-800 dark:text-zinc-100">
                    Projects
                </h3>

                <ul
                    role="list"
                    className="grid grid-cols-1 gap-x-12 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 px-4 mt-9"
                >
                    {projects.map((project) => (
                        <li key={project.title}>
                            <ProjectCard project={project} />
                        </li>
                    ))}
                </ul>

                <div className="flex justify-center mt-10">
                    <Link
                        href="/projects"
                        className="group flex items-center text-sm font-medium text-zinc-800 dark:text-zinc-200 hover:text-teal-500 dark:hover:text-teal-500"
                    >
                        Show more
                        <ChevronDownIcon className="ml-3 h-auto w-[10px] stroke-zinc-500 group-hover:stroke-teal-500 dark:group-hover:stroke-teal-500" />
                    </Link>
                </div>
            </div>

        </Container>
    );
}