import { expect } from '@playwright/test'

import { User } from '@actors/user'
import { removeHttpCredential } from '@utils/remove-http-credential'

import { Question } from '@questions/question'

/**
 * Asserts if the current page URL matches the one provided.
 * E.g.: IsPageUrl.matching(/.*us\.coca-cola\.com/)
 * @method `.matching()` Static initializer. Receives a URL to match and compares with the current page URL.
 * It accepts either a string, regex or a URL object to compare.
 * @method `.waitingUpTo()` [optional] Additional method that can be used for waiting a maximum timeout to complete the whole step.
 * Minimum is 1000 miliseconds for this case.
 */
export class IsPageUrl implements Question<void> {
	private url: string | RegExp

	private timeout: number

	constructor(url: string | RegExp | URL) {
		this.url = url instanceof RegExp ? url : removeHttpCredential(url).toString()
	}

	public static matching(url: string | RegExp | URL): IsPageUrl {
		return new IsPageUrl(url)
	}

	public waitingUpTo(miliseconds: number): IsPageUrl {
		this.timeout = miliseconds > 1000 ? miliseconds : 1000
		return this
	}

	public async askAs(user: User): Promise<void> {
		return expect(user.abilities.browseTheWeb.page).toHaveURL(this.url, { timeout: this.timeout })
	}
}
