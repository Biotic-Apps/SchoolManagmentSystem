import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { errorMessage } from "./error-messages";
import { toast } from "./toast";

interface ApiMutationOptions<TData, TVars> {
  mutationFn: (vars: TVars) => Promise<TData>;
  invalidate?: QueryKey[];
  success?: string | ((data: TData, vars: TVars) => string);
  /** Forms show errors inline, so they turn the toast off. */
  toastError?: boolean;
}

export function useApiMutation<TData = unknown, TVars = void>({
  mutationFn,
  invalidate = [],
  success,
  toastError = true,
}: ApiMutationOptions<TData, TVars>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async (data, vars) => {
      await Promise.all(invalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
      if (success) toast.success(typeof success === "function" ? success(data, vars) : success);
    },
    onError: (error) => {
      if (toastError) toast.error(errorMessage(error));
    },
  });
}
