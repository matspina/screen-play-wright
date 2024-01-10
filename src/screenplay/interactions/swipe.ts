import { Activity } from '@activity'
import { User } from '@actors/user'

/**
 * Action to swipe the view from an element to another.
 * NOTE: ONLY WORKS IN DESKTOP.
 * E.g.: Swipe.from('div.selector1').to('div.selector2')
 * @method `.from()` Static initializer. Receives a selector to start swipping.
 * @method `.to()` Receives a selector to end the swipping.
 */
export class Swipe implements Activity<void> {
	private fromSelector: string

	private toSelector: string

	constructor(selector: string) {
		this.fromSelector = selector
	}

	public static from(selector: string): Swipe {
		return new Swipe(selector)
	}

	public to(selector: string): Swipe {
		this.toSelector = selector
		return this
	}

	public async performAs({
		abilities: {
			browseTheWeb: { page }
		}
	}: User): Promise<void> {
		await page.locator(this.fromSelector).hover({ force: true })
		await page.mouse.down()
		await page.locator(this.toSelector).hover({ force: true })
		await page.mouse.up()
	}
}
