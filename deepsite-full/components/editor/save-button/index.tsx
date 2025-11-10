/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "sonner";
import { MdDownload } from "react-icons/md";

import { Button } from "@/components/ui/button";

export function SaveButton({ html }: { html: string }) {
  const downloadFile = () => {
    let filename = prompt("Filename for your HTML export:", "index.html");
    if (!filename) return;
    if (!filename.endsWith(".html")) filename += ".html";
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    toast.success("HTML downloaded successfully!");
  };

  return (
    <Button variant="outline" onClick={downloadFile} className="flex items-center gap-2">
      <MdDownload className="size-4" />
      Export HTML
    </Button>
  );
}
