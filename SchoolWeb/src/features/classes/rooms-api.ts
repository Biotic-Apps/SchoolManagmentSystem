import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { Option } from "@/components/shared/OptionSelect";
import { OPTIONS_PAGE } from "@/config/options";
import { http, type Query } from "@/lib/http";
import { withRowFlash } from "@/lib/row-highlight";
import { useApiMutation } from "@/lib/use-api-mutation";
import type { Room, RoomInput } from "./types";

export const roomKeys = {
  all: ["rooms"] as const,
  list: (params: Query) => ["rooms", "list", params] as const,
};

export function useRooms(params: Query, enabled = true) {
  return useQuery({
    queryKey: roomKeys.list(params),
    queryFn: () => http.get<Room[]>("/rooms", params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useRoomOptions(branchId: string | null) {
  const query = useRooms({ ...OPTIONS_PAGE, branchId }, !!branchId);
  const options: Option[] = (query.data?.data ?? []).map((room) => ({ id: room.id, name: room.name }));
  return { options, isLoading: query.isLoading };
}

export function useSaveRoom() {
  return useApiMutation({
    mutationFn: withRowFlash(
      ({ id, input }: { id?: string; input: RoomInput }) =>
        id ? http.patch<Room>(`/rooms/${id}`, input) : http.post<Room>("/rooms", input),
      (result, vars) => vars.id ?? result.data.id,
    ),
    // Section rows show room names.
    invalidate: [roomKeys.all, ["sections"]],
    success: (_, vars) => (vars.id ? "Room updated" : "Room added"),
    toastError: false,
  });
}
