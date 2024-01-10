import { Activity } from '@activity'
import { User } from '@actors/user'

/**
 * Returns the element text.
 * E.g.: GetTextContent.from('div.selector')
 * @method `.from()` Static initializer. A selector to search for an element.
 * If there are multiple elements satisfying the selector, the first will be used.
 */
export class GetTextContent implements Activity<string> {
	private selector: string

	private frameLocator: string

	constructor(selector: string) {
		this.selector = selector
	}

	public static from(selector: string): GetTextContent {
		return new GetTextContent(selector)
	}

	public fromIframe(frameLocator: string): GetTextContent {
		this.frameLocator = frameLocator
		return this
	}

	public async performAs({
		abilities: {
			browseTheWeb: { page }
		}
	}: User): Promise<string> {
		if (this.frameLocator) {
			return page.frameLocator(this.frameLocator).locator(this.selector).textContent()
		}

		const element = page.locator(this.selector)
		const elementHandle = await element.elementHandle()
		const elementTagName = await (await elementHandle.getProperty('tagName')).jsonValue()
		return elementTagName === 'INPUT' ? element.inputValue() : page.textContent(this.selector)
	}
}
