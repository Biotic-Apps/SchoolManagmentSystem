"use client";

import Link from "next/link";
import { CircleUser, LogOut } from "lucide-react";
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
          "grid size-10 place-items-center rounded-full bg-selected text-label font-semibold text-on-selected",
          focusRing,
        )}
      >
        {initials(name)}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-label font-medium text-fg">{name}</span>
          {email && <span>{email}</span>}
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
