import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: 0,
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Start both servers automatically when running tests
  webServer: [
    {
      command: 'npm run dev',
      cwd: '../backend',
      port: 3001,
      reuseExistingServer: true,
      timeout: 30_000,
    },
    {
      command: 'npm run dev',
      cwd: '../frontend',
      port: 5173,
      reuseExistingServer: true,
      timeout: 30_000,
    },
  ],
});
