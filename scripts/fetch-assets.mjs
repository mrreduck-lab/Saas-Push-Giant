import { mkdir, writeFile, access } from 'node:fs/promises';
import { dirname } from 'node:path';

const assets = [
  {
    id: '1z_j_76krs1HNLa_KhOxX8mdE3JJWOSYO',
    path: 'public/brand/raschini-logo.png',
  },
  {
    id: '1jQZ0LhTSbTMAip5WMD0pN3pJQk2p85m3',
    path: 'public/video/hero-mobile.mp4',
  },
  {
    id: '1Y6B4SX8eGoAeXg5CpJUZI2kziu_Ewcwg',
    path: 'public/images/hero-poster.webp',
  },
];

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function download({ id, path }) {
  if (await exists(path)) return;

  await mkdir(dirname(path), { recursive: true });
  const url = `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`;
  const response = await fetch(url, { redirect: 'follow' });

  if (!response.ok) {
    throw new Error(`Failed to download ${path}: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    throw new Error(`Google Drive returned HTML instead of asset for ${path}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length < 1024) {
    throw new Error(`Downloaded asset is unexpectedly small: ${path}`);
  }
  await writeFile(path, buffer);
  console.log(`Downloaded ${path} (${Math.round(buffer.length / 1024)} KB)`);
}

await Promise.all(assets.map(download));
