import { Interaction } from '@interaction'
import { Response } from '@playwright/test'

import { User } from '@actors/user'

type WaitUntil = 'domcontentloaded' | 'networkidle' | 'load' | 'commit'

/**
 * Action to reload the page.
 * E.g.: Reload.thePage()
 * @method `.thePage()` Static initializer. Reloads the page.
 * @method `.andWaitUntil()` [optional] Specifies how the navigation will wait to complete the step.
 * Available options: 'domcontentloaded' | 'networkidle' | 'load' | 'commit'. Defaults to 'load'.
 */
export class Reload implements Interaction<Response> {
	private waitUntil: WaitUntil = 'load'

	private queryParameter: string

	public static thePage(): Reload {
		return new Reload()
	}

	public andWaitUntil(waitUntil: WaitUntil): Reload {
		this.waitUntil = waitUntil
		return this
	}

	public appending(queryParameter: string): Reload {
		this.queryParameter = queryParameter
		return this
	}

	public async performAs(user: User): Promise<Response> {
		if (this.queryParameter) {
			const currentUrl = await user.abilities.browseTheWeb.page.evaluate('window.location.href')
			return user.abilities.browseTheWeb.page.goto(currentUrl + this.queryParameter)
		}
		return user.abilities.browseTheWeb.page.reload({ waitUntil: this.waitUntil })
	}
}
