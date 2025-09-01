import { expect } from '@playwright/test'
import { Question } from '@question'

import { User } from '@actors/user'
import retryExpect from '@utils/retry-expect'

/**
 * Asserts if the browser has a given cookie or local storage item, with a value or not.
 * E.g.: IsBrowserContaining.cookie('my-cookie')
 * E.g.: IsBrowserContaining.cookie('my-cookie').withValue('123')
 * E.g.: IsBrowserContaining.localStorageItem('my-item').withValue('123')
 * @method `.cookie()` Static initializer. Receives a cookie name to search for.
 * @method `.localStorageItem()` Static initializer. Receives a local storage item name to search for.
 * @method `.withValue()` Receives a value to assert the cookie value or local storage item value.
 */
export class IsBrowserContaining implements Question<void> {
	private cookieName: string

	private localStorageItem: string

	private value: string

	constructor(items: Record<string, string>) {
		this.cookieName = items.cookieName
		this.localStorageItem = items.localStorageItem
	}

	public static cookie(cookieName: string): IsBrowserContaining {
		return new IsBrowserContaining({ cookieName })
	}

	public static localStorageItem(localStorageItem: string): IsBrowserContaining {
		return new IsBrowserContaining({ localStorageItem })
	}

	public withValue(value: string): IsBrowserContaining {
		this.value = value
		return this
	}

	public async askAs(user: User): Promise<void> {
		await retryExpect(async () => {
			if (this.cookieName) {
				const cookiesNames = []
				const cookies = await user.abilities.browseTheWeb.page.context().cookies()
				cookies.forEach(cookie => cookiesNames.push(cookie.name))
				expect(cookiesNames).toContain(this.cookieName)
				if (this.value) expect(cookies.find(cookie => cookie.name === this.cookieName).value).toBe(this.value)
			}
			if (this.localStorageItem) {
				const localStorageItems = await user.abilities.browseTheWeb.page.evaluate(() => window.localStorage)
				expect(Object.keys(localStorageItems)).toContain(this.localStorageItem)
				if (this.value) expect(localStorageItems[this.localStorageItem]).toBe(this.value)
			}
		})
	}
}
