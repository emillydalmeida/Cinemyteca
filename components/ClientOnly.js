import { useIsClient } from '../hooks/useIsClient';

export default function ClientOnly({ children, fallback = null }) {
  const isClient = useIsClient();

  if (!isClient) {
    return fallback;
  }

  return children;
}
