import { getSupabaseAdmin, isSupabaseConfigured, storageBucket } from "@/lib/supabase";
import { slugify } from "@/lib/validation";
import type { UploadedAsset } from "@/lib/types";

export async function uploadProjectAssets(projectId: string, files: File[]) {
  if (!isSupabaseConfigured()) {
    return Promise.all(
      files.map(async (file) => ({
        path: `${projectId}/${file.name}`,
        publicUrl: `data:${file.type};base64,${Buffer.from(await file.arrayBuffer()).toString("base64")}`,
        name: file.name,
        size: file.size,
        contentType: file.type,
      })),
    );
  }

  const supabase = getSupabaseAdmin();
  const bucket = storageBucket();
  const assets: UploadedAsset[] = [];

  for (const file of files) {
    const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
    const path = `${projectId}/${crypto.randomUUID()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}.${extension}`;
    const body = Buffer.from(await file.arrayBuffer());

    const { error } = await supabase.storage.from(bucket).upload(path, body, {
      contentType: file.type,
      upsert: false,
    });

    if (error) throw new Error(`Falha ao enviar imagem: ${error.message}`);

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    assets.push({
      path,
      publicUrl: data.publicUrl,
      name: file.name,
      size: file.size,
      contentType: file.type,
    });
  }

  return assets;
}
