import { useMutation } from "@tanstack/react-query";
import { errorMessage } from "@/lib/error-messages";
import { http } from "@/lib/http";
import { toast } from "@/lib/toast";
import type { FilePurpose, UploadedFile } from "./types";

export function uploadFile(file: File, purpose: FilePurpose): Promise<UploadedFile> {
  const form = new FormData();
  form.append("file", file);
  form.append("purpose", purpose);
  return http.upload<UploadedFile>("/files", form).then((result) => result.data);
}

export function useUploadFile(purpose: FilePurpose) {
  return useMutation({
    mutationFn: (file: File) => uploadFile(file, purpose),
    onError: (error) => toast.error(errorMessage(error)),
  });
}
