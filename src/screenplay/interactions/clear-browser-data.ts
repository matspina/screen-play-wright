import { Interaction } from '@interaction'

import { User } from '@actors/user'

/**
 * Action to clear all browser cookies and local storage items for the current domain.
 * E.g.: ClearBrowser.data()
 * @method `.data()` Static initializer. Clears all browser data.
 */
export class ClearBrowser implements Interaction<void> {
	public static data(): ClearBrowser {
		return new ClearBrowser()
	}

	public async performAs({
		abilities: {
			browseTheWeb: { page }
		}
	}: User): Promise<void> {
		await page.evaluate('window.localStorage.clear()')
		await page.context().clearCookies()
	}
}
