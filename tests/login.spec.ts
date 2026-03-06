import { test, expect, type Page } from '@playwright/test';

const MOCK_USERS = {
  valid: { username: process.env.SEED_USERNAME, password: process.env.SEED_PASSWORD },
  invalid: { username: 'nonexistent_user', password: 'wrongpass' },
};

async function fillLoginForm(page: Page, username: string, password: string) {
  await page.fill('#username', username);
  await page.fill('#password', password);
}

test.describe('Login flow — form interaction', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test('user fills username and password, clicks Login, and is redirected home', async ({ page }) => {
    await page.goto('/login');
    await fillLoginForm(page, MOCK_USERS.valid.username!, MOCK_USERS.valid.password!);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL('/profile');
  })

  test('stays on /login when the request fails', async ({ page }) => {
    await page.goto('/login');
    await fillLoginForm(page, MOCK_USERS.invalid.username, MOCK_USERS.invalid.password!);
    await page
    .getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL('/login');
  })
})
