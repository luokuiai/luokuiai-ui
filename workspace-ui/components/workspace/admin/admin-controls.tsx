"use client";

import type { ReactNode } from "react";
import { Chip } from "../../base/badges/chip";
import { Select, SelectItem } from "../../base/select/select";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "../../base/table/table";
import { formatInteger, runStatuses, type Run } from "./admin-data";

export type Column<Row> = { id: string; label: string; render: (row: Row) => ReactNode };

export function AdminTable<Row extends { id: string }>({ label, items, columns }: { label: string; items: Row[]; columns: Column<Row>[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border-button-default bg-background-primary-default">
      <Table aria-label={label} size="sm" className="min-w-[550px]">
        <TableHeader columns={columns}>
          {(column) => <TableColumn isRowHeader={column.id === columns[0].id}>{column.label}</TableColumn>}
        </TableHeader>
        <TableBody items={items} renderEmptyState={() => <span className="p-4 text-text-secondary">没有符合条件的记录。</span>}>
          {(row) => <TableRow columns={columns}>{(column) => <TableCell>{column.render(row)}</TableCell>}</TableRow>}
        </TableBody>
      </Table>
    </div>
  );
}

export function AdminFilter({ label, value, onChange, options }: { label: string; value: string; onChange: (key: string) => void; options: readonly (readonly [string, string])[] }) {
  return (
    <Select className="min-w-[144px]" aria-label={label} selectedKey={value} onSelectionChange={(key) => { if (key !== null) onChange(String(key)); }}>
      {options.map(([id, text]) => <SelectItem key={id} id={id}>{text}</SelectItem>)}
    </Select>
  );
}

export function RunStatus({ status }: { status: Run["status"] }) {
  const color = { queued: "neutral", running: "blue", succeeded: "lime", failed: "rose", canceled: "neutral" } as const;
  return <Chip variant="subtle" color={color[status]}>{runStatuses[status]}</Chip>;
}

export function EnabledStatus({ enabled }: { enabled: boolean }) {
  return <Chip variant="subtle" color={enabled ? "lime" : "neutral"}>{enabled ? "已启用" : "已暂停"}</Chip>;
}

export function AdminMetrics({ items }: { items: { label: string; value: number | string; detail?: string }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {items.map(({ label, value, detail }) => (
        <div key={label} className="grid gap-2 rounded-2xl border border-border-button-default bg-background-primary-default p-4 sm:p-5">
          <dt className="text-body-medium text-text-secondary">{label}</dt>
          <dd className="text-title-1-semibold tabular-nums">{typeof value === "number" ? formatInteger(value) : value}</dd>
          {detail && <dd className="text-caption-1-medium text-text-tertiary">{detail}</dd>}
        </div>
      ))}
    </dl>
  );
}

export function AdminFeedback({ message }: { message: string }) {
  return <p role="status" className="text-body-regular text-text-secondary empty:hidden">{message}</p>;
}
