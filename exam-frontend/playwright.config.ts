import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // ujian memerlukan sequential state
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    // Desktop
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // Android (simulasi)
    { name: 'android-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'android-tablet', use: { ...devices['Galaxy Tab S4'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
