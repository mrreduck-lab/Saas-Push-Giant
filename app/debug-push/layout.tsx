import { privateMetadata } from '../route-metadata';

export const metadata = privateMetadata;

export default function DebugPushLayout({ children }: { children: React.ReactNode }) {
  return children;
}
