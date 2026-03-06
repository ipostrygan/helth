import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(`${baseURL}/login`);
  await page.fill('#username', 'admin');
  await page.fill('#password', process.env.SEED_PASSWORD!);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('**/profile');

  await page.context().storageState({ path: 'playwright/.auth/user.json' });
  await browser.close();
}

export default globalSetup;
