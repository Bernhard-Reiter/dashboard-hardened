import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Dashboard/);
  });

  test('health check endpoint returns 200', async ({ page }) => {
    const response = await page.goto('/api/health');
    expect(response?.status()).toBe(200);

    const data = await response?.json();
    expect(data.status).toBe('healthy');
    expect(data.service).toBe('coding-machine-dashboard');
  });
});
