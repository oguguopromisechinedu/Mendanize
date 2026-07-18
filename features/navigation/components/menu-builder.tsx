"use client";

import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
import type { MenuItemRecord, MenuItemTypeValue, MenuItemWrite } from "@/services/navigation/types";
import { MENU_ITEM_TYPES } from "../constants/constants";

export type MenuItemDraft = {
  clientId: string;
  label: string;
  itemType: MenuItemTypeValue;
  href: string;
  entityId: string;
  icon: string;
  openInNewTab: boolean;
  visible: boolean;
  badgeLabel: string;
  children: MenuItemDraft[];
};

let draftSeq = 0;
function nextClientId() {
  draftSeq += 1;
  return `item-${draftSeq}-${Math.random().toString(36).slice(2, 7)}`;
}

export function itemsFromRecords(items: MenuItemRecord[]): MenuItemDraft[] {
  return items.map((item) => ({
    clientId: item.id,
    label: item.label,
    itemType: item.itemType,
    href: item.href ?? "",
    entityId: item.entityId ?? "",
    icon: item.icon ?? "",
    openInNewTab: item.openInNewTab,
    visible: item.visible,
    badgeLabel: item.badgeLabel ?? "",
    children: itemsFromRecords(item.children),
  }));
}

export function draftsToWrite(items: MenuItemDraft[]): MenuItemWrite[] {
  return items.map((item, index) => ({
    label: item.label,
    itemType: item.itemType,
    href: item.href || null,
    entityId: item.entityId || null,
    icon: item.icon || null,
    openInNewTab: item.openInNewTab,
    visible: item.visible,
    badgeLabel: item.badgeLabel || null,
    sortOrder: index,
    children: draftsToWrite(item.children),
  }));
}

function emptyItem(): MenuItemDraft {
  return {
    clientId: nextClientId(),
    label: "New link",
    itemType: "CUSTOM_URL",
    href: "/",
    entityId: "",
    icon: "",
    openInNewTab: false,
    visible: true,
    badgeLabel: "",
    children: [],
  };
}

type MenuBuilderProps = {
  items: MenuItemDraft[];
  maxDepth: number;
  onChange: (items: MenuItemDraft[]) => void;
};

export function MenuBuilder({ items, maxDepth, onChange }: MenuBuilderProps) {
  return (
    <div className="space-y-3">
      <ItemList
        items={items}
        depth={1}
        maxDepth={maxDepth}
        onChange={onChange}
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => onChange([...items, emptyItem()])}
      >
        Add item
      </Button>
    </div>
  );
}

function ItemList({
  items,
  depth,
  maxDepth,
  onChange,
}: {
  items: MenuItemDraft[];
  depth: number;
  maxDepth: number;
  onChange: (items: MenuItemDraft[]) => void;
}) {
  function updateAt(index: number, next: MenuItemDraft) {
    onChange(items.map((item, i) => (i === index ? next : item)));
  }

  function removeAt(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function move(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= items.length) return;
    const copy = [...items];
    const tmp = copy[index];
    copy[index] = copy[next];
    copy[next] = tmp;
    onChange(copy);
  }

  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={item.clientId}>
          <ItemEditor
            item={item}
            depth={depth}
            maxDepth={maxDepth}
            canMoveUp={index > 0}
            canMoveDown={index < items.length - 1}
            onChange={(next) => updateAt(index, next)}
            onRemove={() => removeAt(index)}
            onMoveUp={() => move(index, -1)}
            onMoveDown={() => move(index, 1)}
          />
        </li>
      ))}
    </ul>
  );
}

function ItemEditor({
  item,
  depth,
  maxDepth,
  canMoveUp,
  canMoveDown,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  item: MenuItemDraft;
  depth: number;
  maxDepth: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onChange: (item: MenuItemDraft) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const id = useId();
  const [expanded, setExpanded] = useState(true);
  const canNest = depth < maxDepth;

  return (
    <div
      className="rounded-lg border border-border bg-surface p-3"
      style={{ marginLeft: depth > 1 ? (depth - 1) * 12 : 0 }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Input
          aria-label="Label"
          value={item.label}
          onChange={(e) => onChange({ ...item, label: e.target.value })}
          className="min-w-[10rem] flex-1"
        />
        <Button type="button" size="sm" variant="ghost" onClick={onMoveUp} disabled={!canMoveUp}>
          Up
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onMoveDown}
          disabled={!canMoveDown}
        >
          Down
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Collapse" : "Expand"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onRemove}>
          Delete
        </Button>
      </div>

      {expanded ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor={`${id}-type`}>Type</Label>
            <Select
              id={`${id}-type`}
              value={item.itemType}
              onChange={(e) =>
                onChange({
                  ...item,
                  itemType: e.target.value as MenuItemTypeValue,
                })
              }
            >
              {MENU_ITEM_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${id}-href`}>URL / path</Label>
            <Input
              id={`${id}-href`}
              value={item.href}
              onChange={(e) => onChange({ ...item, href: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${id}-entity`}>Entity id</Label>
            <Input
              id={`${id}-entity`}
              value={item.entityId}
              onChange={(e) => onChange({ ...item, entityId: e.target.value })}
              placeholder="Optional content id"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${id}-icon`}>Icon key</Label>
            <Input
              id={`${id}-icon`}
              value={item.icon}
              onChange={(e) => onChange({ ...item, icon: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${id}-badge`}>Badge</Label>
            <Input
              id={`${id}-badge`}
              value={item.badgeLabel}
              onChange={(e) => onChange({ ...item, badgeLabel: e.target.value })}
              placeholder="e.g. New"
            />
          </div>
          <div className="flex items-center justify-between gap-2 pt-6">
            <Label htmlFor={`${id}-visible`}>Visible</Label>
            <Switch
              id={`${id}-visible`}
              checked={item.visible}
              onCheckedChange={(v) => onChange({ ...item, visible: Boolean(v) })}
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor={`${id}-tab`}>Open in new tab</Label>
            <Switch
              id={`${id}-tab`}
              checked={item.openInNewTab}
              onCheckedChange={(v) =>
                onChange({ ...item, openInNewTab: Boolean(v) })
              }
            />
          </div>
        </div>
      ) : null}

      {canNest ? (
        <div className="mt-3 space-y-2 border-t border-border pt-3">
          <p className="text-xs font-medium text-muted-foreground">
            Nested items (depth {depth}/{maxDepth})
          </p>
          <ItemList
            items={item.children}
            depth={depth + 1}
            maxDepth={maxDepth}
            onChange={(children) => onChange({ ...item, children })}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              onChange({ ...item, children: [...item.children, emptyItem()] })
            }
          >
            Add nested item
          </Button>
        </div>
      ) : null}
    </div>
  );
}
