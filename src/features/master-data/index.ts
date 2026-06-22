/**
 * ============================================================
 * @module      master-data
 * @layer       barrel
 * @file        index.ts
 * @path        src/features/master-data/index.ts
 * @description Public API modul master-data.
 * @since       v1.0.0
 * ============================================================
 */

export { MasterDataPage } from './components/MasterDataPage'
export { PermissionGuard } from './components/PermissionGuard'
export { useMasterDataList } from './hooks/useMasterDataList'
export type { MasterDataItem, MasterDataPayload } from './types'
