import { Interaction } from '@interaction'

import { User } from '@actors/user'

/**
 * Action to fill for a <input>, <textarea> or [contenteditable] element with some text.
 * E.g.: Fill.in('div.selector').with('text')
 * @method `.in()` Static initializer. Receives a selector to fill in.
 * @method `.with()` Receives the text to fill in the given element.
 * Note that you can pass an empty string to clear the input field.
 */
export class Fill implements Interaction<void> {
	private selector: string

	private text: string

	private frameLocator: string

	constructor(selector: string) {
		this.selector = selector
	}

	public static in(selector: string): Fill {
		return new Fill(selector)
	}

	public with(text: string): Fill {
		this.text = text
		return this
	}

	public fromIframe(frameLocator: string): Fill {
		this.frameLocator = frameLocator
		return this
	}

	public async performAs(user: User): Promise<void> {
		if (this.frameLocator) {
			return user.abilities.browseTheWeb.page.frameLocator(this.frameLocator).locator(this.selector).fill(this.text)
		}
		return user.abilities.browseTheWeb.page.fill(this.selector, this.text)
	}
}
