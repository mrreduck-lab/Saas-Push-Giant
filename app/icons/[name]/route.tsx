import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

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

export async function GET(request: NextRequest, { params }: { params: { name: string } }) {
  const size = sizes[params.name];
  if (!size) return new Response('Not found', { status: 404 });

  const logoUrl = new URL('/IMG_4803.png', request.url).toString();
  const isTiny = size <= 32;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
          padding: isTiny ? '2px' : size >= 512 ? '44px' : '18px',
        }}
      >
        <img
          src={logoUrl}
          alt="Raschini"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </div>
    ),
    {
      width: size,
      height: size,
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    },
  );
}
