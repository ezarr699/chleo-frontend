/**
 * ============================================================
 * @module      shared
 * @layer       shared > component
 * @file        nav-main.tsx
 * @path        src/shared/components/nav-main.tsx
 * @description Daftar navigasi utama sidebar (shadcn block sidebar-08),
 *              disesuaikan untuk memakai React Router NavLink agar
 *              status aktif mengikuti route saat ini. Setiap item
 *              di-render lewat NavMainCollapsibleItem supaya state
 *              open/close Collapsible bisa controlled per-item (lihat
 *              komentar di komponen tersebut soal alasannya). Sub-item
 *              opsional punya `category` — kalau diisi, item dengan
 *              category yang sama dikelompokkan lalu dirender sebagai
 *              Collapsible sendiri (lihat NavMainCategoryGroup), jadi
 *              tiap kategori bisa dibuka/tutup independen dari kategori
 *              lain. Item tanpa category tetap tampil sebagai daftar
 *              datar seperti sebelumnya (lihat groupItemsByCategory).
 * @ui          shadcn/ui: Collapsible, Sidebar
 * @since       v1.0.0
 * @ref         https://ui.shadcn.com/docs/components/sidebar
 * ============================================================
 */

import { useState } from 'react'
import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/shared/components/ui/sidebar'
import { ChevronRightIcon } from 'lucide-react'

export interface NavMainSubItem {
  title: string
  url: string
  category?: string
}

export interface NavMainItem {
  title: string
  url: string
  icon: ReactNode
  items?: NavMainSubItem[]
}

interface NavMainCategoryBucket {
  category?: string
  items: NavMainSubItem[]
}

/** Kelompokkan item beruntun yang punya `category` sama jadi satu bucket. */
function groupItemsByCategory(items: NavMainSubItem[]): NavMainCategoryBucket[] {
  const buckets: NavMainCategoryBucket[] = []

  for (const item of items) {
    const lastBucket = buckets[buckets.length - 1]
    if (lastBucket && lastBucket.category === item.category) {
      lastBucket.items.push(item)
    } else {
      buckets.push({ category: item.category, items: [item] })
    }
  }

  return buckets
}

export function NavMain({ items }: { items: NavMainItem[] }) {
  const { pathname } = useLocation()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <NavMainCollapsibleItem
            key={item.title}
            item={item}
            isActive={pathname === item.url}
          />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

interface NavMainCollapsibleItemProps {
  item: NavMainItem
  isActive: boolean
}

function NavMainCollapsibleItem({ item, isActive }: NavMainCollapsibleItemProps) {
  // Collapsible di-render controlled (open/onOpenChange) bukan defaultOpen,
  // karena `isActive` berubah tiap navigasi (dihitung dari pathname) —
  // Base UI Collapsible melempar warning kalau defaultOpen sebuah
  // komponen uncontrolled berubah setelah mount.
  const [open, setOpen] = useState(isActive)

  return (
    <Collapsible open={open} onOpenChange={setOpen} render={<SidebarMenuItem />}>
      <SidebarMenuButton
        tooltip={item.title}
        isActive={isActive}
        render={<NavLink to={item.url} end />}
      >
        {item.icon}
        <span>{item.title}</span>
      </SidebarMenuButton>
      {item.items?.length ? (
        <>
          <CollapsibleTrigger render={<SidebarMenuAction className="aria-expanded:rotate-90" />}>
            <ChevronRightIcon />
            <span className="sr-only">Toggle</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {groupItemsByCategory(item.items).map((bucket) =>
                bucket.category ? (
                  <NavMainCategoryGroup key={bucket.category} category={bucket.category} items={bucket.items} />
                ) : (
                  bucket.items.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton render={<NavLink to={subItem.url} />}>
                        <span>{subItem.title}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))
                ),
              )}
            </SidebarMenuSub>
          </CollapsibleContent>
        </>
      ) : null}
    </Collapsible>
  )
}

interface NavMainCategoryGroupProps {
  category: string
  items: NavMainSubItem[]
}

/** Satu kategori data master, collapsible independen dari kategori lain. */
function NavMainCategoryGroup({ category, items }: NavMainCategoryGroupProps) {
  const { pathname } = useLocation()
  const hasActiveChild = items.some((subItem) => subItem.url === pathname)
  const [open, setOpen] = useState(hasActiveChild)

  return (
    <li>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="group text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex w-full items-center justify-between rounded-md px-2 py-1.5 text-[0.6875rem] font-medium tracking-wide uppercase outline-hidden">
          <span>{category}</span>
          <ChevronRightIcon
            className="size-3.5 shrink-0 transition-transform group-aria-expanded:rotate-90"
            aria-hidden="true"
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {items.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton render={<NavLink to={subItem.url} />}>
                  <span>{subItem.title}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </li>
  )
}
