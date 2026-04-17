import { NextResponse } from "next/server";
import { generateSiteContent } from "@/lib/ai";
import { createProject } from "@/lib/projects";
import { renderLandingPage } from "@/lib/site-renderer";
import { uploadProjectAssets } from "@/lib/storage";
import { parseSiteForm, validateImages } from "@/lib/validation";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const parsed = parseSiteForm(formData);
    if (parsed.errors || !parsed.data) {
      return NextResponse.json({ ok: false, errors: parsed.errors }, { status: 400 });
    }

    const images = formData.getAll("images").filter((entry): entry is File => entry instanceof File);
    const validation = validateImages(images);
    if (validation.errors.length > 0) {
      return NextResponse.json({ ok: false, error: validation.errors.join(" ") }, { status: 400 });
    }

    const projectId = crypto.randomUUID();
    const assets = validation.files.length > 0 ? await uploadProjectAssets(projectId, validation.files) : [];
    const generation = await generateSiteContent(parsed.data);
    const previewHtml = renderLandingPage(parsed.data, generation.content, assets);

    const project = await createProject({
      id: projectId,
      formData: parsed.data,
      generatedContent: generation.content,
      previewHtml,
      assets,
      aiLog: generation.log,
      usedAi: generation.usedAi,
    });

    return NextResponse.json({
      ok: true,
      projectId: project.id,
      previewUrl: `/preview/${project.id}`,
      usedAi: generation.usedAi,
      aiLog: generation.log,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado ao gerar site.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
