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
 *              komentar di komponen tersebut soal alasannya).
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

export interface NavMainItem {
  title: string
  url: string
  icon: ReactNode
  items?: { title: string; url: string }[]
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
              {item.items.map((subItem) => (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton render={<NavLink to={subItem.url} />}>
                    <span>{subItem.title}</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </>
      ) : null}
    </Collapsible>
  )
}
