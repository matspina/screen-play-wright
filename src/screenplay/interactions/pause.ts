import { Interaction } from '@interaction'

import { User } from '@actors/user'

/**
 * Pause the execution to debug the test and manipulate the browser.
 * E.g.: Pause.execution()
 * @method `.execution()` Static initializer. Pauses the execution.
 */
export class Pause implements Interaction<void> {
	public static execution(): Pause {
		return new Pause()
	}

	public async performAs(user: User): Promise<void> {
		return user.abilities.browseTheWeb.page.pause()
	}
}
