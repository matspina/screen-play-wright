import { Interaction } from '@interaction'

import { User } from '@actors/user'

/**
 * Action to select an option in dropdown lists.
 * E.g.: Select.inDropdown('select.selector').theLabel('April')
 * @method `.inDropdown()` Static initializer. Receives a selector to match the select/dropdown element.
 * @method `.theValue()` Matches an item by the dropdown element's value attribute.
 * @method `.theLabel()` Matches an item by the dropdown element's label attribute. If none, element's text is matched.
 * @method `.theIndex()` Matches an item by the dropdown index.
 */
export class Select implements Interaction<string[]> {
	private selector: string

	private value: string

	private label: string

	private index: number

	private frameLocator: string

	constructor(selector: string) {
		this.selector = selector
	}

	public static inDropdown(selector: string): Select {
		return new Select(selector)
	}

	public theValue(value: string): Select {
		this.value = value
		return this
	}

	public theLabel(label: string): Select {
		this.label = label
		return this
	}

	public theIndex(index: number): Select {
		this.index = index
		return this
	}

	public fromIframe(frameLocator: string): Select {
		this.frameLocator = frameLocator
		return this
	}

	public async performAs(user: User): Promise<string[]> {
		if (this.value) {
			if (this.frameLocator) {
				return user.abilities.browseTheWeb.page
					.frameLocator(this.frameLocator)
					.locator(this.selector)
					.selectOption({ value: this.value })
			}
			return user.abilities.browseTheWeb.page.selectOption(this.selector, { value: this.value })
		}
		if (this.label) {
			if (this.frameLocator) {
				return user.abilities.browseTheWeb.page
					.frameLocator(this.frameLocator)
					.locator(this.selector)
					.selectOption({ label: this.label })
			}
			return user.abilities.browseTheWeb.page.selectOption(this.selector, { label: this.label })
		}
		if (this.index) {
			if (this.frameLocator) {
				return user.abilities.browseTheWeb.page
					.frameLocator(this.frameLocator)
					.locator(this.selector)
					.selectOption({ index: this.index })
			}
			return user.abilities.browseTheWeb.page.selectOption(this.selector, { index: this.index })
		}
	}
}
