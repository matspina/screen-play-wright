import 'tsconfig-paths/register'
import { test } from '@playwright/test'

import { BrowseTheWeb } from '@abilities/browse-the-web'
import { RetrieveUserData } from '@config/demo-site/users'

import { SamplePageTest } from '@page-objects/demo-site/sample-page-test'

import { Navigate } from '@interactions/navigate'

const user = RetrieveUserData.generic()

test.beforeEach(async ({ page }) => {
	user.can(BrowseTheWeb.with(page))
})

test.describe('Sample page user tests', async () => {
	test.describe('Success flows', async () => {
		test.only('TITLE', async () => {
			await user.attemptsTo(Navigate.to(SamplePageTest.URL).andWaitUntil('networkidle'))
		})
	})

	test.describe('Negative flows', async () => {
		test('TITLE', async () => {
			// await user.attemptsTo(Navigate.to())
		})
	})
})
