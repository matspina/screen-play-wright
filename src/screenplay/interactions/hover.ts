import { Interaction } from '@interaction'

import { User } from '@actors/user'

/**
 * Action to hover over an element.
 * E.g.: Hover.on('div.selector')
 * @method `.on()` Static initializer. Receives a selector for hovering.
 */
export class Hover implements Interaction<void> {
	private selector: string

	private frameLocator: string

	constructor(selector: string) {
		this.selector = selector
	}

	public static on(selector: string): Hover {
		return new Hover(selector)
	}

	public fromIframe(frameLocator: string): Hover {
		this.frameLocator = frameLocator
		return this
	}

	public async performAs(user: User): Promise<void> {
		if (this.frameLocator) {
			return user.abilities.browseTheWeb.page.frameLocator(this.frameLocator).locator(this.selector).hover()
		}
		return user.abilities.browseTheWeb.page.hover(this.selector)
	}
}
