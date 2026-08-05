import type { Metadata } from 'next';

export function marketingMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | Push Giant`,
      description,
      url: path,
    },
  };
}

export const privateMetadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};
