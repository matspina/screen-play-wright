/* eslint-disable no-param-reassign */
import { Page } from '@playwright/test'
import colors from 'colors'

import { PageWithGUID } from '@abilities/browse-the-web'
import { Activity } from '@activity'
import { User } from '@actors/user'
import playwrightTestConfig from '@config/playwright.config'

/**
 * Action to switch and focus on another browser tab when available.
 * E.g.: SwitchToTab.number(2)
 * @method `.number()` Static initializer. Receives the tab number to switch and focus. Note: Tab number starts on 1.
 */
export class SwitchToTab implements Activity<void> {
	private number: number

	constructor(number: number) {
		this.number = number
	}

	public static number(number: number): SwitchToTab {
		return new SwitchToTab(number)
	}

	public async performAs(user: User): Promise<void> {
		let allPages: Array<Page>
		let requestedPage: Page
		await new Promise<void>((resolve, reject) => {
			const timeoutId = setTimeout(() => {
				const TABS_MSG = allPages.length === 1 ? '1' : allPages.length === 2 ? '1, 2' : `1 to ${allPages.length}`
				reject(
					new Error(
						'error on SwitchToTab interaction.\n' +
							`Page tab number ${colors.yellow.bold(this.number.toString())} does not exist.\n` +
							`Page tabs available: ${colors.green.bold(TABS_MSG)}`
					)
				)
			}, playwrightTestConfig.use.actionTimeout)
			const intervalId = setInterval(async () => {
				allPages = user.abilities.browseTheWeb.page.context().pages()
				requestedPage = allPages[this.number - 1]
				if (requestedPage) {
					clearInterval(intervalId)
					clearTimeout(timeoutId)
					resolve()
				}
			}, 250)
		})

		user.abilities.browseTheWeb.page = requestedPage as PageWithGUID
		await user.abilities.browseTheWeb.page.bringToFront()
		await user.abilities.browseTheWeb.page.evaluate(() => {
			document.dispatchEvent(new Event('visibilitychange'))
		})
	}
}
