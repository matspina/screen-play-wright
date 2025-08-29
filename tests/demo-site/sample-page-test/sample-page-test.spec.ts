import 'tsconfig-paths/register'
import { test } from '@playwright/test'

import { BrowseTheWeb } from '@abilities/browse-the-web'
import { RetrieveUserData } from '@config/demo-site/users'

import { SamplePageTest } from '@page-objects/demo-site/sample-page-test'

import { Click } from '@interactions/click'
import { Fill } from '@interactions/fill'
import { Navigate } from '@interactions/navigate'
import { WaitFor } from '@interactions/wait-for'
import { DoesScreenshotMatchSnapshot } from '@questions/generics/does-screenshot-match-snapshot'
import { IsElement } from '@questions/generics/is-element'
import { IsPageUrl } from '@questions/generics/is-page-url-matching'
import { IsText } from '@questions/generics/is-text-matching'

const user = RetrieveUserData.generic()

test.use({ storageState: './browser-states/demo-sample-page-cached-state.json' })

test.beforeEach(async ({ page }) => {
	user.can(BrowseTheWeb.with(page))
})

test.describe('Sample page user tests', async () => {
	test.describe('Positive flows', async () => {
		test('Assert page URL', async () => {
			await user.attemptsTo(Navigate.to(SamplePageTest.URL))
			await user.asks(IsPageUrl.matching(SamplePageTest.URL))
		})

		test('Submit form with valid data and assert success message', async () => {
			await user.attemptsTo(Navigate.to(SamplePageTest.URL))
			await user.attemptsTo(Fill.in(SamplePageTest.SELECTORS.ELEMENTS.INPUT_NAME).with('John Doe'))
			await user.attemptsTo(Fill.in(SamplePageTest.SELECTORS.ELEMENTS.INPUT_EMAIL).with('john.doe@example.com'))
			await user.attemptsTo(Click.on(SamplePageTest.SELECTORS.ELEMENTS.CHECKBOX_AUTOMATION))
			await user.attemptsTo(
				Fill.in(SamplePageTest.SELECTORS.ELEMENTS.TEXT_AREA_COMMENTS).with('This is a test comment')
			)
			await user.attemptsTo(Click.on(SamplePageTest.SELECTORS.BUTTONS.SUBMIT))
			await user.attemptsTo(WaitFor.networkIdle())

			await user.asks(IsElement.visible(SamplePageTest.SELECTORS.ELEMENTS.CONTACT_FORM_SUCCERSS_HEADER))
			await user.asks(
				IsText.from(SamplePageTest.SELECTORS.ELEMENTS.CONTACT_FORM_SUCCERSS_HEADER).matching(
					'Your message has been sent'
				)
			)
		})

		test('Visual regression of the page header', async () => {
			await user.attemptsTo(Navigate.to(SamplePageTest.URL).andWaitUntil('networkidle'))
			await user.asks(
				DoesScreenshotMatchSnapshot.of('sample-page-header').fromSelector(
					SamplePageTest.SELECTORS.ELEMENTS.PAGE_HEADER_CONTAINER
				)
			)
		})
	})

	test.describe('Negative flows', async () => {
		// SKIPPED BECAUSE THE WEBSITE IS NOT WORKING AS EXPECTED
		test.skip('Try to submit form with invalid data and assert error message', async () => {
			await user.attemptsTo(Navigate.to(SamplePageTest.URL).andWaitUntil('networkidle'))
			await user.attemptsTo(Fill.in(SamplePageTest.SELECTORS.ELEMENTS.INPUT_EMAIL).with('john.doe'))
			await user.attemptsTo(
				Fill.in(SamplePageTest.SELECTORS.ELEMENTS.TEXT_AREA_COMMENTS).with('This is a test comment')
			)
			await user.attemptsTo(Click.on(SamplePageTest.SELECTORS.BUTTONS.SUBMIT))
			await user.attemptsTo(WaitFor.networkIdle())

			await user.asks(IsElement.visible(SamplePageTest.SELECTORS.ELEMENTS.FORM_ERROR_WRAPPER))
			await user.asks(IsText.from(SamplePageTest.SELECTORS.ELEMENTS.FORM_ERROR_WRAPPER).containing('Name is required'))
			await user.asks(
				IsText.from(SamplePageTest.SELECTORS.ELEMENTS.FORM_ERROR_WRAPPER).containing(
					'Email requires a valid email address'
				)
			)
		})
	})
})
