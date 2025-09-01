import { Interaction } from '@interaction'

import { User } from '@actors/user'

/**
 * Action to scroll the view to a specified position or locator.
 * E.g.: Scroll.to(800)
 * E.g.: Scroll.to('div.footer')
 * @method `.to()` Static initializer. Receives the position or locator selector for scrolling.
 */
export class Scroll implements Interaction<void> {
	private position: number

	private locator: string

	private frameLocator: string

	constructor(value: number | string) {
		if (typeof value === 'number') this.position = value
		if (typeof value === 'string') this.locator = value
	}

	public static to(value: number | string): Scroll {
		return new Scroll(value)
	}

	public fromIframe(frameLocator: string): Scroll {
		this.frameLocator = frameLocator
		return this
	}

	public async performAs({
		abilities: {
			browseTheWeb: { page }
		}
	}: User): Promise<void> {
		if (this.locator) return page.locator(this.locator).scrollIntoViewIfNeeded()
		if (this.frameLocator) return page.frameLocator(this.frameLocator).locator(this.locator).scrollIntoViewIfNeeded()
		if (this.position !== undefined)
			return page.evaluate(`window.scroll( { top: ${this.position}, behavior: 'smooth' })`)
	}
}
