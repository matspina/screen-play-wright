/* eslint-disable no-param-reassign */
import { expect } from '@playwright/test'
import { Question } from '@question'

import { User } from '@actors/user'
import retryExpect from '@utils/retry-expect'

/**
 * Asserts a screenshot taken for visual regression.
 * When running it for the first time, it creates a snapshot baseline for future comparison.
 * E.g.: DoesScreenshotMatchSnapshot.of('testing-feature')
 * In this example above, it would create a folder in the same level of your test .spec containing
 * the baseline with the image name as `testing-feature-[platform].png`
 * @method `.of()` Static initializer. Receives the image name to be created and compared afterwards.
 * @method `.fromFullPage()` [optional] Takes a screenshot of the full scrollable page, instead of the currently visible viewport.
 * @method `.fromSelector()` [optional] Receives a selector to take a screenshot of the element area only.
 * @method `.masking()` [optional] Receives a selector to mask (with a pink box) it from the screenshot image. It can be used multiple times.
 * @method `.hiding()` [optional] Receives a selector to hide it from the screenshot image. It can be used multiple times.
 * E.g.: DoesScreenshotMatchSnapshot.of('testing-feature').fromFullPage().hiding('div.selector-a').hiding('div.selector-b')
 */
export class DoesScreenshotMatchSnapshot implements Question<void> {
	private screenshotName: Array<string>

	private fullPage: boolean

	private selector: string

	private selectorsToMask = []

	private selectorsToHide = []

	private maxDiffPixels = 0

	constructor(screenshotName: string) {
		this.screenshotName = [process.env.IS_DOCKER ? 'docker' : 'local', `${screenshotName}.png`]
	}

	public static of(screenshotName: string): DoesScreenshotMatchSnapshot {
		return new DoesScreenshotMatchSnapshot(screenshotName)
	}

	public fromFullPage(): DoesScreenshotMatchSnapshot {
		this.fullPage = true
		return this
	}

	public fromSelector(selector: string): DoesScreenshotMatchSnapshot {
		this.selector = selector
		return this
	}

	public masking(selectorToMask: string): DoesScreenshotMatchSnapshot {
		this.selectorsToMask.push(selectorToMask)
		return this
	}

	public hiding(selector: string): DoesScreenshotMatchSnapshot {
		this.selectorsToHide.push(selector)
		return this
	}

	public withMaxDiffPixelsOf(pixels: number): DoesScreenshotMatchSnapshot {
		this.maxDiffPixels = pixels
		return this
	}

	public async askAs({
		abilities: {
			browseTheWeb: { page }
		}
	}: User): Promise<void> {
		const screenshotOptions = {
			timeout: 0,
			threshold: 0.3,
			maxDiffPixels: this.maxDiffPixels,
			mask: this.selectorsToMask.map(selector => page.locator(selector))
		}

		if (this.selectorsToHide.length > 0) {
			for (const selector of this.selectorsToHide)
				await page.locator(selector).evaluateAll(elements => {
					for (const element of elements) element.style.opacity = '0'
				})
			await page.waitForTimeout(200)
		}

		return retryExpect(
			async () => {
				if (this.selector)
					return expect(page.locator(this.selector)).toHaveScreenshot(this.screenshotName, screenshotOptions)
				return expect(page).toHaveScreenshot(this.screenshotName, {
					...screenshotOptions,
					fullPage: this.fullPage
				})
			},
			{ retryInterval: 2500, expectTimeout: 5000 }
		)
	}
}
