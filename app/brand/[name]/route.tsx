import { ImageResponse } from 'next/og';

export const runtime = 'edge';

const sizes: Record<string, number> = {
  'apple-touch-icon.png': 180,
  'icon-192.png': 192,
  'icon-512.png': 512,
  'icon-maskable-512.png': 512,
  'push-icon-192.png': 192,
  'favicon-32.png': 32,
  'favicon-16.png': 16,
};

export async function GET(_request: Request, { params }: { params: { name: string } }) {
  const size = sizes[params.name];
  if (!size) return new Response('Not found', { status: 404 });

  const tiny = size <= 32;
  const maskable = params.name.includes('maskable');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#17130f',
          color: '#f8f1e6',
          borderRadius: maskable ? 0 : size >= 180 ? Math.round(size * 0.18) : 0,
          fontFamily: 'Georgia',
          fontSize: tiny ? Math.round(size * 0.48) : Math.round(size * 0.42),
          letterSpacing: tiny ? 0 : '-0.06em',
          paddingRight: tiny ? 0 : Math.round(size * 0.03),
        }}
      >
        PG
      </div>
    ),
    {
      width: size,
      height: size,
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
    },
  );
}
