import { Activity } from '@activity'
import { User } from '@actors/user'

/**
 * Action to press down a key of the keyboard.
 * E.g.: KeyboardDown.theFollowingKey('Tab')
 * @method `.theFollowingKey()` Static initializer. Receives the key to be pressed.
 */
export class KeyboardDown implements Activity<void> {
	private key: string

	constructor(key: string) {
		this.key = key
	}

	public static theFollowingKey(key: string): KeyboardDown {
		return new KeyboardDown(key)
	}

	public async performAs(user: User): Promise<void> {
		return user.abilities.browseTheWeb.page.keyboard.down(this.key)
	}
}
