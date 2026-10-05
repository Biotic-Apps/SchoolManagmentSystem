import { useServerForm } from "@/lib/use-server-form";
import { useSaveRoom } from "./rooms-api";
import { roomFormDefaults, roomSchema, toRoomInput, type RoomFormValues } from "./schemas";
import type { Room } from "./types";

export function useRoomForm(item: Room | null, branchId: string, onDone: () => void) {
  const save = useSaveRoom();
  return useServerForm<RoomFormValues>({
    schema: roomSchema,
    defaultValues: roomFormDefaults(item),
    onSubmit: (values) =>
      save.mutateAsync({ id: item?.id, input: { ...toRoomInput(values), ...(item ? {} : { branchId }) } }),
    onSuccess: onDone,
    conflictField: "name",
  });
}
