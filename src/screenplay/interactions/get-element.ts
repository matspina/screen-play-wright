import { Locator } from '@playwright/test'

import { Activity } from '@activity'
import { User } from '@actors/user'

/**
 * Returns an element locator that can be used to perform actions on the page.
 * E.g.: GetElement.withSelector('div.selector')
 * @method `.withSelector()` Static initializer. A selector to use when resolving DOM element.
 */
export class GetElement implements Activity<Locator> {
	private selector: string

	private frameLocator: string

	constructor(selector: string) {
		this.selector = selector
	}

	public static withSelector(selector: string): GetElement {
		return new GetElement(selector)
	}

	public fromIframe(frameLocator: string): GetElement {
		this.frameLocator = frameLocator
		return this
	}

	public async performAs(user: User): Promise<Locator> {
		if (this.frameLocator) {
			return user.abilities.browseTheWeb.page.frameLocator(this.frameLocator).locator(this.selector)
		}
		return user.abilities.browseTheWeb.page.locator(this.selector)
	}
}
