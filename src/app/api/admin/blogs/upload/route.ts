import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../_utils";
import { createServiceClient } from "@/lib/supabase-server";

function sanitizeFilename(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9\.\-]/g, "-");
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.res;

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "missing_file" }, { status: 400 });

  const supabase = await createServiceClient();
  const timestamp = Date.now();
  const clean = sanitizeFilename(file.name || "upload.bin");
  const path = `${timestamp}-${clean}`;

  const arrayBuf = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuf);
  const { error } = await supabase.storage
    .from("blog-images")
    .upload(path, bytes, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, path });
}