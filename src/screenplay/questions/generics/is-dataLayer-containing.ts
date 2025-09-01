import { expect } from '@playwright/test'
import { Question } from '@question'
import colors from 'colors'

import { User } from '@actors/user'
import retryExpect from '@utils/retry-expect'

/**
 * Asserts a record in Data Layer.
 * You can pass a whole record/object or part of it.
 * E.g.: IsDataLayerContaining.aRecordWith({ event: 'gtm.linkClick', 'gtm.elementUrl': 'us.coca-cola.com' })
 * @method `.aRecordWith()` Static initializer. Receives the record/object to be asserted.
 * @method `.timerEvent()` Static initializer. Ensure the data layer is ready by checking the timer event.
 * @method `.withCountOf()` Asserts how many times the given data layer object is found in the array.
 */
export class IsDataLayerContaining implements Question<void> {
	private record: Record<string, unknown>

	private retryTimeout: number

	private expectedCount: number

	constructor(record: Record<string, unknown>, retryTimeout?: number) {
		this.record = record
		this.retryTimeout = retryTimeout
	}

	/**
	 * @param {object} record Object with parameters and values to be found in Data Layer.
	 */
	public static aRecordWith(record: Record<string, unknown>): IsDataLayerContaining {
		return new IsDataLayerContaining(record)
	}

	public static timerEvent(): IsDataLayerContaining {
		return new IsDataLayerContaining({ event: 'gtm.timer' }, 10000)
	}

	public withCountOf(number: number): IsDataLayerContaining {
		this.expectedCount = number
		return this
	}

	private customizeMessageColor(): Record<string, string> {
		const errorMsg = colors.bold.inverse(' Object record not found ')
		const expectedMsg = colors.bold.underline.green('Expected to contain:')
		const receivedMsg = colors.bold.underline.red('Received:')
		return {
			errorMsg,
			expectedMsg,
			receivedMsg
		}
	}

	private throwCustomMessageError(record: Record<string, unknown>, object: Array<Record<string, unknown>>): void {
		const { errorMsg, expectedMsg, receivedMsg } = this.customizeMessageColor()
		throw new Error(
			`${errorMsg}\n\n${expectedMsg}
			${colors.green(JSON.stringify(record, null, 2))}\n\n${receivedMsg}
			${colors.red(JSON.stringify(object, null, 2))}`
		)
	}

	private searchObjectPropertyInArray(
		dataLayer: Array<Record<string, unknown>>,
		expectedObject: Record<string, unknown>,
		expectedCount: number
	): void {
		let foundCount = 0
		for (const index in dataLayer) {
			if (dataLayer[index])
				try {
					expect(dataLayer[index]).toMatchObject(expectedObject)
					foundCount++
				} catch (_e) {
					if (Number(index) === dataLayer.length - 1 && foundCount === 0) {
						this.throwCustomMessageError(expectedObject, dataLayer)
					}
				}
		}
		if (expectedCount)
			expect(
				foundCount,
				`Expected ${expectedCount} records but found ${foundCount}\n\nExpected:
				${colors.green(JSON.stringify(expectedObject, null, 2))}\n\nReceived:
				${colors.red(JSON.stringify(dataLayer, null, 2))}`
			).toEqual(expectedCount)
	}

	public async askAs(user: User): Promise<void> {
		await retryExpect(
			async () => {
				const browserDataLayer = JSON.parse(
					await Promise.race([
						user.abilities.browseTheWeb.page.evaluate('JSON.stringify(dataLayer)'),
						user.abilities.browseTheWeb.page.waitForTimeout(500)
					]).then(result => (typeof result === 'string' ? result : '[]'))
				)
				this.searchObjectPropertyInArray(browserDataLayer, this.record, this.expectedCount)
			},
			{ expectTimeout: this.retryTimeout }
		)
	}
}
