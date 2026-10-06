import { useState } from "react";
import { errorMessage } from "@/lib/error-messages";
import { toast } from "@/lib/toast";
import { downloadImportTemplate } from "./imports-api";
import type { ImportKind } from "./import-types";

export function useTemplateDownload() {
  const [downloading, setDownloading] = useState(false);

  const download = async (kind: ImportKind) => {
    setDownloading(true);
    try {
      await downloadImportTemplate(kind);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setDownloading(false);
    }
  };

  return { download, downloading };
}
