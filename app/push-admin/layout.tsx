import { privateMetadata } from '../route-metadata';

export const metadata = privateMetadata;

export default function PushAdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
