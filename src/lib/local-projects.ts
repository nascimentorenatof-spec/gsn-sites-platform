import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { SiteProject } from "@/lib/types";

const storageDir = path.join(process.cwd(), ".local");
const storageFile = path.join(storageDir, "projects.json");

async function readProjects() {
  try {
    const content = await readFile(storageFile, "utf8");
    const parsed = JSON.parse(content) as unknown;
    return Array.isArray(parsed) ? (parsed as SiteProject[]) : [];
  } catch {
    return [];
  }
}

async function writeProjects(projects: SiteProject[]) {
  await mkdir(storageDir, { recursive: true });
  await writeFile(storageFile, JSON.stringify(projects, null, 2), "utf8");
}

export async function createLocalProject(project: SiteProject) {
  const projects = await readProjects();
  projects.unshift(project);
  await writeProjects(projects);
  return project;
}

export async function getLocalProject(id: string) {
  const projects = await readProjects();
  return projects.find((project) => project.id === id) ?? null;
}

export async function updateLocalProject(id: string, values: Partial<SiteProject> & Record<string, unknown>) {
  const projects = await readProjects();
  const index = projects.findIndex((project) => project.id === id);
  if (index < 0) return null;

  const updated = {
    ...projects[index],
    ...values,
    updated_at: new Date().toISOString(),
  } as SiteProject;

  projects[index] = updated;
  await writeProjects(projects);
  return updated;
}
