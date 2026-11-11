import Link from "next/link";
import { Flag } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4 bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="w-12 h-12 mx-auto rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
          <Flag className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Page Not Found</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          The requested race or page could not be found. Check your schedule view or return to the main dashboard.
        </p>
        <div>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 transition-opacity"
          >
            Back to Race This Week
          </Link>
        </div>
      </div>
    </div>
  );
}

