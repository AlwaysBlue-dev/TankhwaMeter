import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <p className="mb-4 text-8xl font-black tracking-tighter text-muted-foreground/20">
        404
      </p>

      <h1 className="mb-2 text-2xl font-bold">Page not found</h1>
      <p className="mb-8 text-muted-foreground">
        The page you're looking for doesn't exist or has been moved.
        Let's get you back on track.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search Salaries
          </Link>
        </Button>
      </div>
    </div>
  );
}
