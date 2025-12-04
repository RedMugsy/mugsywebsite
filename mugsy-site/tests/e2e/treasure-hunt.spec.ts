import { test, expect, type Page } from '@playwright/test';

declare global {
  interface Window {
    __setTreasureHuntRegistrationTurnstileToken?: (token: string) => void;
    __setPromoterSelfRegistrationTurnstileToken?: (token: string) => void;
  }
}

const treasureLandingPath = '/#/treasure-hunt';

async function satisfyRegistrationCaptcha(page: Page) {
  await page.waitForFunction(() => typeof (window as any).__setTreasureHuntRegistrationTurnstileToken === 'function');
  await page.evaluate(() => (window as any).__setTreasureHuntRegistrationTurnstileToken?.('e2e-token'));
}

async function satisfyPromoterCaptcha(page: Page) {
  await page.waitForFunction(() => typeof (window as any).__setPromoterSelfRegistrationTurnstileToken === 'function');
  await page.evaluate(() => (window as any).__setPromoterSelfRegistrationTurnstileToken?.('e2e-token'));
}

test.describe('Treasure Hunt experience', () => {
  test('landing page exposes hero content and CTA', async ({ page }) => {
    await page.goto(treasureLandingPath);

    await expect(page.getByRole('heading', { level: 1, name: /red mugsy treasure hunt/i })).toBeVisible();
    const cta = page.getByRole('link', { name: /join the hunt/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '#/treasure-hunt/register');
  });
});

test.describe('Participant registration', () => {
  test('shows validation errors when submitted empty', async ({ page }) => {
    await page.goto('/#/treasure-hunt/register');
    await page.getByRole('button', { name: /submit registration/i }).click();

    await expect(page.getByText('Please enter your first name.')).toBeVisible();
    await expect(page.getByText('Please enter your last name.')).toBeVisible();
    await expect(page.getByText('Please enter a valid email address.')).toBeVisible();
    await expect(page.getByText('Please enter a valid mobile number.')).toBeVisible();
    await expect(page.getByText('Please complete the security verification.')).toBeVisible();
  });

  test('completes free-tier submission once required data is present', async ({ page }) => {
    await page.goto('/#/treasure-hunt/register');

    await page.getByLabel(/first name/i).fill('Test');
    await page.getByLabel(/last name/i).fill('User');
    await page.getByLabel(/email address/i).fill('test-user@example.com');
    await page.getByLabel(/mobile phone number/i).fill('+12345678900');

    await satisfyRegistrationCaptcha(page);

    await page.getByRole('button', { name: /submit registration/i }).click();

    await expect(page.getByRole('heading', { level: 1, name: /success! you're in/i })).toBeVisible();
    await expect(page.getByText(/welcome to the red mugsy treasure hunt/i)).toBeVisible();
  });
});

test.describe('Promoter self-registration', () => {
  test('submits individual application and shows success screen', async ({ page }) => {
    await page.goto('/#/treasure-hunt/promoter-register');

    await page.locator('label:has-text("First Name") + input').first().fill('Promo');
    await page.locator('label:has-text("Last Name") + input').first().fill('Tester');
    await page.locator('label:has-text("Phone Number") + input').first().fill('+19876543210');
    await page.locator('label:has-text("Email Address") + input').first().fill('promo@example.com');
    await page.locator('label:has-text("Forecasted Number of Participants") + input').fill('42');

    await satisfyPromoterCaptcha(page);

    await page.getByRole('button', { name: /submit application/i }).click();

    await expect(page.getByRole('heading', { level: 1, name: /registration submitted/i })).toBeVisible();
    await expect(page.getByText(/application has been submitted successfully/i)).toBeVisible();
  });
});

test.describe('Promoter sign-in', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
  });

  test('rejects invalid credentials', async ({ page }) => {
    await page.goto('/#/treasure-hunt/promoter-signin');

    await page.getByLabel(/email address/i).fill('wrong@example.com');
    await page.getByLabel(/password/i).fill('badpass');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByText('Invalid email or password. Please try again.')).toBeVisible();
  });

  test('accepts demo credentials and loads dashboard', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem('promoterTermsAccepted', 'true');
    });

    await page.goto('/#/treasure-hunt/promoter-signin');

    await page.getByLabel(/email address/i).fill('demo@redmugsy.com');
    await page.getByLabel(/password/i).fill('demo123');
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.waitForURL('**/#/treasure-hunt/promoters');
    await expect(page.getByText('Promoters Dashboard')).toBeVisible();
  });
});

test.describe('Admin sign-in', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
  });

  test('surfaces API errors for invalid credentials', async ({ page }) => {
    await page.route('**/api/auth/admin/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid email or password.' })
      });
    });

    await page.goto('/#/treasure-hunt/admin-signin');

    await page.getByLabel('Email').fill('not-admin@example.com');
    await page.getByLabel('Password').fill('wrongpass');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByText('Invalid email or password.')).toBeVisible();
  });

  test('logs in with demo credentials and reveals admin panel', async ({ page }) => {
    await page.goto('/#/treasure-hunt/admin-signin');

    await page.getByLabel('Email').fill('demo@redmugsy.com');
    await page.getByLabel('Password').fill('demo123');
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.waitForURL('**/#/treasure-hunt/admin');
    await expect(page.getByRole('heading', { name: /admin panel/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /📊 dashboard & participants/i })).toBeVisible();
  });
});
