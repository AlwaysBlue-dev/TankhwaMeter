"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>

      <h1 className="mb-2 text-2xl font-bold">Something went wrong</h1>
      <p className="mb-8 text-muted-foreground">
        An unexpected error occurred. Please try again — if the problem persists,
        come back in a few minutes.
      </p>

      {process.env.NODE_ENV === "development" && error.message && (
        <pre className="mb-6 w-full overflow-x-auto rounded-lg border bg-muted px-4 py-3 text-left text-xs text-muted-foreground">
          {error.message}
        </pre>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={unstable_retry}>Try again</Button>
        <Button variant="outline" asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}
