"use client";

import Link from "next/link";
import { ChevronDown, CircleUser, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { focusRing } from "@/components/ui/styles";
import { navItem } from "@/config/navigation";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

interface UserMenuProps {
  name: string;
  email?: string | null;
  onSignOut: () => void;
}

export function UserMenu({ name, email, onSignOut }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className={cn(
          "group flex items-center gap-2 rounded-full p-0.5 transition-colors duration-(--dur-quick) hover:bg-background md:pr-2.5 data-[state=open]:bg-background",
          focusRing,
        )}
      >
        <span className="grid size-9 place-items-center rounded-full bg-primary text-label font-semibold text-on-primary shadow-xs">
          {initials(name)}
        </span>
        <span className="hidden max-w-36 truncate text-label font-medium text-fg md:block">{name}</span>
        <ChevronDown
          aria-hidden
          className="hidden size-4 text-fg-muted transition-transform duration-(--dur-quick) ease-standard group-data-[state=open]:rotate-180 md:block"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-56">
        <DropdownMenuLabel className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-selected text-label font-semibold text-on-selected">
            {initials(name)}
          </span>
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-label font-medium text-fg">{name}</span>
            {email && <span className="truncate">{email}</span>}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={navItem("profile").route}>
            <CircleUser />
            {navItem("profile").label}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onSignOut}>
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
