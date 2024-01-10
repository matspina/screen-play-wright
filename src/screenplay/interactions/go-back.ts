import { Activity } from '@activity'
import { User } from '@actors/user'

type WaitUntil = 'load' | 'domcontentloaded' | 'networkidle' | 'commit'

/**
 * Action to go back to the last page.
 * E.g.: Go.back()
 * @method `.back()` Static initializer. Performs the go back action.
 * @method `.andWaitUntil()` [OPTIONAL] Defines when load should be considered completed.
 */
export class Go implements Activity<void> {
	private state: WaitUntil

	public static back(): Go {
		return new Go()
	}

	public andWaitUntil(state: WaitUntil): Go {
		this.state = state
		return this
	}

	public async performAs(user: User): Promise<void> {
		await user.abilities.browseTheWeb.page.goBack({
			waitUntil: this.state
		})
	}
}
