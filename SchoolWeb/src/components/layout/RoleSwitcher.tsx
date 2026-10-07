"use client";

import { ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { roleLabel } from "@/config/roles";

interface RoleSwitcherProps {
  roles: string[];
  activeRole: string;
  onChange: (role: string) => void;
}

export function RoleSwitcher({ roles, activeRole, onChange }: RoleSwitcherProps) {
  if (roles.length < 2) {
    return (
      <Badge tone="primary" className="hidden sm:inline-flex">
        {roleLabel(activeRole)}
      </Badge>
    );
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="sm" aria-label="Switch role">
          {roleLabel(activeRole)}
          <ChevronsUpDown className="text-fg-muted" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Working as</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={activeRole} onValueChange={onChange}>
          {roles.map((role) => (
            <DropdownMenuRadioItem key={role} value={role}>
              {roleLabel(role)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
