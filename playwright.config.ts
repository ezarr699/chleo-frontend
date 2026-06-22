/**
 * ============================================================
 * @layer       test > config
 * @file        playwright.config.ts
 * @path        playwright.config.ts
 * @description Konfigurasi Playwright untuk visual UI testing.
 * @ref         https://playwright.dev/docs/test-configuration
 * ============================================================
 */

import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: [['html', { outputFolder: 'tests/e2e/reports' }]],

  use: {
    // demo.localhost = seeded demo tenant (Modules/Tenancy/Database/Seeders/DemoTenantSeeder.php)
    baseURL: 'http://demo.localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
