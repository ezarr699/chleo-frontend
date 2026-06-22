/**
 * ============================================================
 * @module      app
 * @layer       app > layout
 * @file        DashboardLayout.tsx
 * @path        src/app/layouts/DashboardLayout.tsx
 * @description Layout dashboard berbasis shadcn block "sidebar-08"
 *              (inset sidebar dengan secondary navigation): sidebar kiri
 *              + topbar dengan SidebarTrigger & breadcrumb, konten via
 *              Outlet.
 * @ui          shadcn/ui: Sidebar, Breadcrumb, Separator
 * @since       v1.0.0
 * @ref         https://ui.shadcn.com/docs/components/sidebar
 * ============================================================
 */

import { Outlet } from 'react-router'
import { AppSidebar } from '@/shared/components/app-sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/shared/components/ui/breadcrumb'
import { Separator } from '@/shared/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/shared/components/ui/sidebar'
import { useAuthSession } from '@/features/auth'

export function DashboardLayout() {
  const { data: user } = useAuthSession()

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
