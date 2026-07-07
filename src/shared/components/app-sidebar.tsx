/**
 * ============================================================
 * @module      shared
 * @layer       shared > component
 * @file        app-sidebar.tsx
 * @path        src/shared/components/app-sidebar.tsx
 * @description Sidebar aplikasi (shadcn block sidebar-08): header brand,
 *              navigasi utama, dan menu user di footer. Grup "Data Master"
 *              hanya tampil untuk sub-item yang user punya permission
 *              `*.view`-nya (RBAC) — defense-in-depth UX, penegakan
 *              sesungguhnya ada di middleware `permission:` backend.
 *              MASTER_DATA_RESOURCES sudah diurutkan per `category` (bukan
 *              alfabetis) supaya NavMain bisa menyisipkan label kategori
 *              tiap kali kategorinya berubah — urutan array ini menentukan
 *              urutan tampil, jangan diacak.
 * @ui          shadcn/ui: Sidebar
 * @since       v1.0.0
 * @ref         https://ui.shadcn.com/docs/components/sidebar
 * ============================================================
 */

import { DatabaseIcon, LayoutDashboardIcon, StethoscopeIcon, TerminalIcon, UsersIcon } from 'lucide-react'
import { NavMain, type NavMainItem } from '@/shared/components/nav-main'
import { NavUser } from '@/shared/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/components/ui/sidebar'
import type { User } from '@/features/auth'

const MASTER_DATA_RESOURCES = [
  { title: 'Golongan Darah', url: '/master-data/golongan-darah', permission: 'golongan_darah.view', category: 'Kependudukan & Demografi' },
  { title: 'Jenis Kelamin', url: '/master-data/jenis-kelamin', permission: 'jenis_kelamin.view', category: 'Kependudukan & Demografi' },
  { title: 'Agama', url: '/master-data/agama', permission: 'agama.view', category: 'Kependudukan & Demografi' },
  { title: 'Status Perkawinan', url: '/master-data/status-perkawinan', permission: 'status_perkawinan.view', category: 'Kependudukan & Demografi' },
  { title: 'Pekerjaan', url: '/master-data/pekerjaan', permission: 'pekerjaan.view', category: 'Kependudukan & Demografi' },
  { title: 'Pendidikan Terakhir', url: '/master-data/pendidikan-terakhir', permission: 'pendidikan_terakhir.view', category: 'Kependudukan & Demografi' },
  { title: 'Hubungan Keluarga', url: '/master-data/hubungan-keluarga', permission: 'hubungan_keluarga.view', category: 'Kependudukan & Demografi' },
  { title: 'Penjamin', url: '/master-data/penjamin', permission: 'penjamin.view', category: 'Penjamin & Pembiayaan' },
  { title: 'Asuransi', url: '/master-data/asuransi', permission: 'asuransi.view', category: 'Penjamin & Pembiayaan' },
  { title: 'Profesi', url: '/master-data/profesi', permission: 'profesi.view', category: 'SDM & Klinisi' },
  { title: 'Poliklinik', url: '/master-data/poliklinik', permission: 'poliklinik.view', category: 'SDM & Klinisi' },
  { title: 'Kategori Layanan', url: '/master-data/kategori-layanan', permission: 'kategori_layanan.view', category: 'Layanan & Tarif' },
  { title: 'Kategori Obat', url: '/master-data/kategori-obat', permission: 'kategori_obat.view', category: 'Farmasi & Alkes' },
  { title: 'Satuan', url: '/master-data/satuan', permission: 'satuan.view', category: 'Farmasi & Alkes' },
  { title: 'Kategori Triase', url: '/master-data/kategori-triase', permission: 'kategori_triase.view', category: 'Kegawatdaruratan' },
] as const

export function AppSidebar({
  user,
  ...props
}: { user?: User } & React.ComponentProps<typeof Sidebar>) {
  const visibleMasterData = MASTER_DATA_RESOURCES.filter((r) =>
    user?.permissions.includes(r.permission),
  )

  const navMain: NavMainItem[] = [
    {
      title: 'Dashboard',
      url: '/',
      icon: <LayoutDashboardIcon />,
    },
    ...(user?.permissions.includes('pasien.view')
      ? [{ title: 'Pasien', url: '/pasien', icon: <UsersIcon /> }]
      : []),
    ...(user?.permissions.includes('profil_nakes.view')
      ? [{ title: 'Nakes', url: '/nakes', icon: <StethoscopeIcon /> }]
      : []),
    ...(visibleMasterData.length > 0
      ? [
          {
            title: 'Data Master',
            url: '/master-data',
            icon: <DatabaseIcon />,
            items: visibleMasterData.map((r) => ({ title: r.title, url: r.url, category: r.category })),
          },
        ]
      : []),
  ]

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <TerminalIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Chleo</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
    </Sidebar>
  )
}
