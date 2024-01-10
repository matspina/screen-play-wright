/* eslint-disable no-param-reassign */

import { PageWithGUID } from '@abilities/browse-the-web'
import { Activity } from '@activity'
import { User } from '@actors/user'

/**
 * Open new page/tab in the browser context.
 * E.g.: OpenNew.tab()
 * @method `.tab()` Static initializer. Opens a new page/tab.
 */
export class OpenNew implements Activity<void> {
	public static tab(): OpenNew {
		return new OpenNew()
	}

	public async performAs(user: User): Promise<void> {
		user.abilities.browseTheWeb.page = (await user.abilities.browseTheWeb.page.context().newPage()) as PageWithGUID
		await user.abilities.browseTheWeb.page.bringToFront()
		await user.abilities.browseTheWeb.page.evaluate(() => {
			document.dispatchEvent(new Event('visibilitychange'))
		})
	}
}
