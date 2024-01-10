import { expect } from '@playwright/test'

import { User } from '@actors/user'
import playwrightTestConfig from '@config/playwright.config'

import { WaitFor } from '@interactions/wait-for'
import { Question } from '@questions/question'

/**
 * Asserts element visibility and/or its attributes.
 *
 * E.g.: IsElement.withSelector('div.selector').containingAttribute('attr').withValue('value')
 *
 * E.g.: IsElement.withSelector('div.selector').containingAttribute('attr').and.visible()
 *
 * E.g.: IsElement.visible('div.selector') OR IsElement.notVisible('div.selector')
 *
 * @method `.withSelector()` Static initializer. Receives a selector.
 * @method `.containingAttribute()` Receives an attribute to be found in the element.
 * @method `.withValue()` Receives a string or RegExp to assert the attribute value.
 * @method `.visible()` Static initializer OR instantiated method.
 * If static, receives a selector to assert it is visible.
 * If instantiated, just asserts visibility according to selector received previously.
 * @method `.notVisible()` Static initializer OR instantiated method.
 * If static, receives a selector to assert it is NOT visible.
 * If instantiated, just asserts visibility according to selector received previously.
 * @method `.waitingUpTo()` [optional] Additional method that can be used for waiting a maximum timeout to complete the whole step.
 * @getter `.and` Conjunction. Can be used anywhere to make the writing better.
 */
export class IsElement implements Question<void> {
	private selector: string

	private frameLocator: string

	private visibility: string

	private attribute: string

	private timeout: number = playwrightTestConfig.expect.timeout

	private value: string | RegExp = /.*/

	constructor(selector: string, visibility?: string) {
		this.selector = selector
		this.visibility = visibility
	}

	public static withSelector(selector: string): IsElement {
		return new IsElement(selector)
	}

	public fromIframe(frameLocator: string): IsElement {
		this.frameLocator = frameLocator
		return this
	}

	public containingAttribute(attribute: string): IsElement {
		this.attribute = attribute
		return this
	}

	public withValue(value: string | RegExp): IsElement {
		this.value = value
		return this
	}

	public visible(): IsElement {
		this.visibility = 'visible'
		return this
	}

	public static visible(selector: string): IsElement {
		return new IsElement(selector, 'visible')
	}

	public notVisible(): IsElement {
		this.visibility = 'hidden'
		return this
	}

	public static notVisible(selector: string): IsElement {
		return new IsElement(selector, 'hidden')
	}

	public waitingUpTo(miliseconds: number): IsElement {
		this.timeout = miliseconds
		return this
	}

	public get and(): IsElement {
		return this
	}

	public async askAs(user: User): Promise<void> {
		if (this.visibility === 'visible')
			if (this.frameLocator) {
				const locator = user.abilities.browseTheWeb.page.frameLocator(this.frameLocator).locator(this.selector)
				expect(locator).toBeVisible()
			} else {
				await user.attemptsTo(WaitFor.selector(this.selector).toBe('visible').upTo(this.timeout))
			}
		if (this.visibility === 'hidden')
			if (this.frameLocator) {
				const locator = user.abilities.browseTheWeb.page.frameLocator(this.frameLocator).locator(this.selector)
				expect(locator).toBeHidden()
			} else {
				await user.attemptsTo(WaitFor.selector(this.selector).toBe('hidden').upTo(this.timeout))
			}
		if (this.attribute) {
			if (this.frameLocator) {
				const locator = user.abilities.browseTheWeb.page.frameLocator(this.frameLocator).locator(this.selector)
				expect(
					await locator.getAttribute(this.attribute, { timeout: this.timeout }),
					`Attribute '${this.attribute}' not found`
				).not.toBe(null)
				await expect(locator).toHaveAttribute(this.attribute, this.value)
			} else {
				const locator = user.abilities.browseTheWeb.page.locator(this.selector)
				expect(
					await locator.getAttribute(this.attribute, { timeout: this.timeout }),
					`Attribute '${this.attribute}' not found`
				).not.toBe(null)
				await expect(locator).toHaveAttribute(this.attribute, this.value)
			}
		}
	}
}
