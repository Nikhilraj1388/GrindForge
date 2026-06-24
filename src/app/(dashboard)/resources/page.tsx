import { FolderOpen } from "lucide-react";
export default function ResourcesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <FolderOpen className="size-16 text-muted-foreground/20" />
      <h1 className="mt-4 text-xl font-bold text-foreground">Resources</h1>
      <p className="mt-2 text-sm text-muted-foreground">Coming soon. Share learning resources with your groups.</p>
    </div>
  );
}
