import { put, head } from "@vercel/blob";

export async function uploadBlob(
  path: string,
  data: Buffer | Blob | ArrayBuffer,
  contentType: string
): Promise<string> {
  const { url } = await put(path, data, {
    access: "public",
    contentType,
    addRandomSuffix: false,
  });
  return url;
}

export async function blobExists(path: string): Promise<boolean> {
  try {
    await head(path);
    return true;
  } catch {
    return false;
  }
}
