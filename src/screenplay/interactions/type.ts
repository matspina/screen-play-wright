import { Activity } from '@activity'
import { User } from '@actors/user'

/**
 * Action to type some text in some given element.
 * Sends a keydown, keypress/input, and keyup event for each character in the text.
 * E.g.: Type.theFollowing('testing').in('div.selector')
 * @method `.theFollowing()` Static initializer. Receives the text to be typed.
 * @method `.in()` Receives the selector to type in.
 * @method `.withDelayOf()` [optional] Delay to wait between each character typed.
 */
export class Type implements Activity<void> {
	private text: string

	private delay: number

	private selector: string

	private frameLocator: string

	constructor(text: string) {
		this.text = text
		this.delay = 0
	}

	public static theFollowing(text: string): Type {
		return new Type(text)
	}

	public in(selector: string): this {
		this.selector = selector
		return this
	}

	public withDelayOf(delay: number): this {
		this.delay = delay
		return this
	}

	public fromIframe(frameLocator: string): Type {
		this.frameLocator = frameLocator
		return this
	}

	public async performAs(user: User): Promise<void> {
		if (this.frameLocator)
			return user.abilities.browseTheWeb.page
				.frameLocator(this.frameLocator)
				.locator(this.selector)
				.type(this.text, { delay: this.delay })
		return user.abilities.browseTheWeb.page.type(this.selector, this.text, { delay: this.delay })
	}
}
