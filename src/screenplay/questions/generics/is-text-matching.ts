import { expect } from '@playwright/test'

import { User } from '@actors/user'
import retryExpect from '@utils/retry-expect'

import { Question } from '@questions/question'

/**
 * Text assertions methods.
 * E.g.: IsText.from('div.selector').matching('testing')
 * @method `.from()` Static initializer. Receives a selector to get the text.
 * @method `.matching()` Matches the exact text in the selector to pass the test.
 * @method `.containing()` The selector should contain the text to pass the test.
 * @method `.notContaining()` The selector should NOT contain the text to pass the test.
 * @method `.empty()` The selector should have no text to pass the test.
 */
export class IsText implements Question<unknown> {
	private selector: string

	private valueToMatch: string | RegExp

	private textToContain: string | RegExp

	private textToNotContain: string

	private shouldBeEmpty: boolean

	private timeout: number

	constructor(selector: string) {
		this.selector = selector
	}

	public static from(selector: string): IsText {
		return new IsText(selector)
	}

	public matching(value: string | RegExp): IsText {
		this.valueToMatch = value
		return this
	}

	public containing(text: string | RegExp): IsText {
		this.textToContain = text
		return this
	}

	public notContaining(text: string): IsText {
		this.textToNotContain = text
		return this
	}

	public empty(): IsText {
		this.shouldBeEmpty = true
		return this
	}

	public waitingUpTo(miliseconds: number): IsText {
		this.timeout = miliseconds
		return this
	}

	public async askAs(user: User): Promise<unknown> {
		const element = user.abilities.browseTheWeb.page.locator(this.selector)
		const elementHandle = await element.elementHandle()
		const elementTagName = await (await elementHandle.getProperty('tagName')).jsonValue()
		const NOT_EMPTY_MSG = `Element "${this.selector}" should be empty but it is not.`

		if (elementTagName === 'INPUT' || elementTagName === 'TEXTAREA') {
			return retryExpect(
				async () => {
					const value = await element.inputValue()
					if (this.valueToMatch && typeof this.valueToMatch === 'string') return expect(value).toBe(this.valueToMatch)
					if (this.valueToMatch && this.valueToMatch instanceof RegExp) return expect(value).toMatch(this.valueToMatch)
					if (this.textToContain) return expect(value).toContain(this.textToContain)
					if (this.textToNotContain) return expect(value).not.toContain(this.textToNotContain)
					if (this.shouldBeEmpty) return expect(value, NOT_EMPTY_MSG).toMatch(/^$/)
				},
				{ expectTimeout: this.timeout }
			)
		}

		if (this.valueToMatch) return expect(element).toHaveText(this.valueToMatch, { timeout: this.timeout })
		if (this.textToContain) return expect(element).toContainText(this.textToContain, { timeout: this.timeout })
		if (this.textToNotContain)
			return expect(element).not.toContainText(this.textToNotContain, { timeout: this.timeout })
		if (this.shouldBeEmpty) return expect(element, NOT_EMPTY_MSG).toHaveText(/^$/, { timeout: this.timeout })
	}
}
