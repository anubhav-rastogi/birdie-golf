import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-forest px-6">
      <div className="mx-auto max-w-md text-center">
        <p className="mb-2 text-6xl font-extrabold text-clay">404</p>
        <h1 className="mb-2 text-xl font-bold text-cornsilk">Page not found</h1>
        <p className="mb-8 text-sm text-cornsilk/50">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/">
          <Button variant="primary">Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
