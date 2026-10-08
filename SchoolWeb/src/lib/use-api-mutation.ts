import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { errorMessage } from "./error-messages";
import { toast } from "./toast";

interface ApiMutationOptions<TData, TVars> {
  /** Lets screens track their own pending saves (see useSaveStatus). */
  mutationKey?: QueryKey;
  mutationFn: (vars: TVars) => Promise<TData>;
  invalidate?: QueryKey[];
  success?: string | ((data: TData, vars: TVars) => string);
  /** Forms show errors inline, so they turn the toast off. */
  toastError?: boolean;
}

export function useApiMutation<TData = unknown, TVars = void>({
  mutationKey,
  mutationFn,
  invalidate = [],
  success,
  toastError = true,
}: ApiMutationOptions<TData, TVars>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey,
    mutationFn,
    onSuccess: async (data, vars) => {
      await Promise.all(invalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
      const message = typeof success === "function" ? success(data, vars) : success;
      if (message) toast.success(message);
    },
    onError: (error) => {
      if (toastError) toast.error(errorMessage(error));
    },
  });
}
