import { Interaction } from '@interaction'
import { Response } from '@playwright/test'

import { User } from '@actors/user'
import { removeHttpCredential } from '@utils/remove-http-credential'

type WaitUntil = 'domcontentloaded' | 'networkidle' | 'load' | 'commit'

/**
 * Action to navigate to a URL.
 * E.g.: Navigate.to('https://www.us.coca-cola.com')
 * @method `.to()` Static initializer. Receives a URL to navigate.
 * @method `.andWaitUntil()` [optional] Specifies how the navigation will wait to complete the step.
 * Available options: 'domcontentloaded' | 'networkidle' | 'load' | 'commit'. Defaults to 'load'.
 */
export class Navigate implements Interaction<Response> {
	public url: URL

	public waitUntil: WaitUntil = 'load'

	constructor(url: string | URL) {
		this.url = url instanceof URL ? url : new URL(url)
	}

	public static to(url: string | URL): Navigate {
		return new Navigate(url)
	}

	public andWaitUntil(waitUntil: WaitUntil): Navigate {
		this.waitUntil = waitUntil
		return this
	}

	public async setHttpCredentialsInContext(user: User): Promise<void> {
		if (this.url.username && this.url.password) {
			await user.abilities.browseTheWeb.page.context().setHTTPCredentials({
				username: unescape(this.url.username),
				password: unescape(this.url.password)
			})
			this.url = removeHttpCredential(this.url) as URL
		}
	}

	public async performAs(user: User): Promise<null | Response> {
		await this.setHttpCredentialsInContext(user)
		return user.abilities.browseTheWeb.page.goto(this.url.toString(), { waitUntil: this.waitUntil })
	}
}
