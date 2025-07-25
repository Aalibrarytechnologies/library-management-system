import { Loader2 } from "lucide-react";

export default function AppLoader({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-gray-600 dark:text-gray-300">
      <Loader2 className="animate-spin w-6 h-6 mb-2" />
      {message}
    </div>
  );
}
