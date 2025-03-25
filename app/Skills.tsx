"use client";
import { Container } from "components/Container";
import { useEffect, useState } from "react";

// Define the Skills type
interface Skill {
  category: string;
  name: string;
  percentage: number;
}

// Array of colors for the progress bars
const progressColors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-red-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-cyan-500",
];

export default function Skills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    // Fetch skills data
    const fetchSkills = async () => {
      try {
        const response = await fetch('/content/skills.json');
        const data = await response.json();
        setSkills(data);
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(data.map((skill: Skill) => skill.category))
        );
        setCategories(uniqueCategories as string[]);
      } catch (error) {
        console.error('Failed to fetch skills:', error);
      }
    };
    fetchSkills();
  }, []);

  // Get color for a skill based on its index
  const getSkillColor = (index: number) => {
    return progressColors[index % progressColors.length];
  };

  if (!skills.length) return null;

  return (
    <Container className="mt-24 md:mt-28">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-4xl">
          Skills
        </h2>
        <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400">
          A collection of technical skills I've acquired over the years.
        </p>
        <div className="mt-10 space-y-10">
          {categories.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100 mb-6">
                {category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {skills
                  .filter((skill) => skill.category === category)
                  .map((skill, skillIndex) => (
                    <div 
                      key={skillIndex}
                      className="rounded-lg border border-zinc-100 p-6 dark:border-zinc-700/40 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition"
                    >
                      <div className="mb-3">
                        <h4 className="text-zinc-800 dark:text-zinc-100 font-medium">
                          {skill.name}
                        </h4>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div 
                          className={`${getSkillColor(skillIndex)} h-2.5 rounded-full transition-all duration-1000 ease-out`} 
                          style={{ width: `${skill.percentage}%` }}
                          aria-label={`${skill.percentage}% proficiency in ${skill.name}`}
                        ></div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}