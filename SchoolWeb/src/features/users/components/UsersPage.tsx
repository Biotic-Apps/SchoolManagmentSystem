"use client";

import { Plus } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable } from "@/components/shared/DataTable";
import { FilterBar } from "@/components/shared/FilterBar";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { PageHeader } from "@/components/shared/PageHeader";
import { SecretRevealDialog } from "@/components/shared/SecretRevealDialog";
import { Button } from "@/components/ui/Button";
import { USER_STATUS_OPTIONS } from "@/config/options";
import { useUsersPage } from "../use-users-page";
import { CreateUserDialog } from "./CreateUserDialog";
import { EditUserDialog } from "./EditUserDialog";
import { ResetPasswordDialog } from "./ResetPasswordDialog";
import { UserDetailDrawer } from "./UserDetailDrawer";
import { UserStatusDialog } from "./UserStatusDialog";

export function UsersPage() {
  const page = useUsersPage();
  const { list, query } = page;

  return (
    <>
      <PageHeader
        title="Principals & Admin Users"
        description="Staff accounts, their roles and where they work."
        actions={
          page.canAdd && (
            <Button onClick={() => page.create.show(true)}>
              <Plus />
              Add user
            </Button>
          )
        }
      />
      <FilterBar
        search={{ value: list.search, onChange: list.setSearch, placeholder: "Search name, email or phone" }}
        onReset={list.reset}
      >
        <FilterSelect label="Role" allLabel="All roles" options={page.roleOptions} value={list.filters.role} onChange={(v) => list.setFilter("role", v)} />
        <FilterSelect
          label="Branch"
          allLabel="All branches"
          options={page.branchOptions}
          value={list.filters.branchId}
          onChange={(v) => list.setFilter("branchId", v)}
        />
        <FilterSelect
          label="Status"
          allLabel="All statuses"
          options={USER_STATUS_OPTIONS}
          value={list.filters.status}
          onChange={(v) => list.setFilter("status", v)}
        />
      </FilterBar>
      <DataTable
        columns={page.columns}
        rows={page.rows}
        getRowId={(row) => row.id}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        onRowClick={page.detail.show}
        emptyTitle="No users found"
        emptyDescription="Try other filters, or add a user."
        pagination={page.pagination}
      />
      {page.create.open && <CreateUserDialog onClose={page.create.close} onCreated={page.onCreated} />}
      {page.edit.item && <EditUserDialog user={page.edit.item} onClose={page.edit.close} />}
      <UserStatusDialog user={page.statusTarget.item} onClose={page.statusTarget.close} />
      <ResetPasswordDialog user={page.resetTarget.item} onClose={page.resetTarget.close} onReset={page.onPasswordReset} />
      <UserDetailDrawer user={page.detail.item} onClose={page.detail.close} />
      <ConfirmDialog
        open={!!page.unlockTarget.item}
        onOpenChange={page.unlockTarget.onOpenChange}
        title={`Unlock ${page.unlockTarget.item?.name ?? "this account"}?`}
        description="Clears the lock after too many failed sign-ins so the user can try again now."
        confirmLabel="Unlock account"
        loading={page.unlocking}
        onConfirm={page.confirmUnlock}
      />
      <SecretRevealDialog
        secret={page.revealed?.password ?? null}
        title={page.revealed?.title ?? ""}
        description="Share it with the user privately. It is shown only once."
        onClose={page.clearRevealed}
      />
    </>
  );
}
