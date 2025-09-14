/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { toast } from "sonner";
import { MdSave } from "react-icons/md";
import { useParams } from "next/navigation";

import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export function SaveButton({
  html,
  prompts,
}: {
  html: string;
  prompts: string[];
}) {
  // get params from URL
  const { namespace, repoId } = useParams<{
    namespace: string;
    repoId: string;
  }>();
  const [loading, setLoading] = useState(false);

  const updateSpace = async () => {
    setLoading(true);

    try {
      const res = await api.put(`/me/projects/${namespace}/${repoId}`, {
        html,
        prompts,
      });
      if (res.data.ok) {
        toast.success("Your space is updated! 🎉");
      } else {
        toast.error(res?.data?.error || "Failed to update space");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Button
        variant="default"
        size="sm"
        className="lg:hidden relative"
        onClick={updateSpace}
      >
        Save {loading && <Loading className="ml-2 size-4 animate-spin" />}
      </Button>
      <Button
        variant="default"
        className="max-lg:hidden !px-4 relative"
        onClick={() => {
          let filename = prompt("Nome do arquivo .html:", "index.html");
          if (!filename) return;
          if (!filename.endsWith('.html')) filename += '.html';
          const blob = new Blob([html], { type: "text/html" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.success("HTML baixado com sucesso!");
        }}
      >
        Save to File
        <MdSave className="ml-2" />
      </Button>
    </>
  );
}
