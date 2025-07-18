// playwright.config.js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    screenshot: 'on', // Take screenshot at the end of every test
  },
  reporter: [['html', { open: 'never' }]],
});
