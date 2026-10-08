import { useState } from "react";
import { useDialogState } from "@/lib/use-dialog-state";
import { errorWithDetails } from "@/lib/error-messages";
import type { Option } from "@/components/shared/OptionSelect";
import { useRoomOptions, useSaveRoom } from "../rooms-api";
import { useAddSection, usePatchSection, useRemoveSection, useSetClassTeacher, type SectionPatch } from "../setup-api";
import type { ClassSetup, OverviewSection } from "../setup-types";
import { MATRIC_GROUPS } from "../level-presets";
import { nextSectionName } from "../text";

const DEFAULT_CAPACITY = 40;

/** Sections card: add/remove, capacity, room (with "+ New room"), group and class teacher, all autosaved. */
export function useSectionsCard(setup: ClassSetup, branchId: string, sessionId: string | null) {
  const classId = setup.class.id;
  const add = useAddSection(classId);
  const remove = useRemoveSection(classId);
  const patch = usePatchSection(classId);
  const classTeacher = useSetClassTeacher(classId);
  const rooms = useRoomOptions(branchId);
  const saveRoom = useSaveRoom();
  const removeDialog = useDialogState<OverviewSection>();
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [showRooms, setShowRooms] = useState(false);
  const [showGroups, setShowGroups] = useState(false);

  const sections = setup.sections;
  const groupOptions: Option[] = [...new Set([...MATRIC_GROUPS, ...setup.groups])].map((name) => ({ id: name, name }));

  return {
    sections,
    canEdit: setup.canEditStructure,
    canAllocate: setup.canAllocate,
    roomOptions: rooms.options,
    groupOptions,
    showRooms: showRooms || rooms.options.length > 0 || sections.some((section) => section.room),
    revealRooms: () => setShowRooms(true),
    showGroups: showGroups || setup.groups.length > 0 || setup.subjects.some((subject) => subject.group),
    revealGroups: () => setShowGroups(true),
    adding: add.isPending,
    addSection: () => {
      if (!sessionId) return;
      const last = sections.at(-1);
      void add
        .mutateAsync({
          branchId,
          sessionId,
          classId,
          name: nextSectionName(sections.map((section) => section.name)),
          capacity: last?.capacity ?? DEFAULT_CAPACITY,
        })
        .catch(() => undefined);
    },
    patchSection: (id: string, value: SectionPatch) => patch.mutateAsync({ id, patch: value }),
    setClassTeacher: (sectionId: string, staffId: string | null) => classTeacher.mutateAsync({ sectionId, staffId }),
    createRoom: async (name: string): Promise<Option> => {
      const created = (await saveRoom.mutateAsync({ input: { branchId, name, capacity: null } })).data;
      return { id: created.id, name: created.name };
    },
    removeDialog,
    removeError,
    removing: remove.isPending,
    askRemove: (section: OverviewSection) => {
      setRemoveError(null);
      removeDialog.show(section);
    },
    confirmRemove: async () => {
      const target = removeDialog.item;
      if (!target) return;
      try {
        await remove.mutateAsync(target.id);
        removeDialog.close();
      } catch (error) {
        setRemoveError(errorWithDetails(error));
      }
    },
  };
}

export type SectionsCardState = ReturnType<typeof useSectionsCard>;
