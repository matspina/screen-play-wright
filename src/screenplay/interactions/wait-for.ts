import { Interaction } from '@interaction'
import { ElementHandle } from '@playwright/test'

import { User } from '@actors/user'
import playwrightTestConfig from '@config/playwright.config'

const { actionTimeout, navigationTimeout } = playwrightTestConfig.use

type VisibilityState = 'attached' | 'detached' | 'visible' | 'hidden'

/**
 * Action to wait for a selector, a timeout or for the network to be idle.
 * E.g.: WaitFor.timeout(1500) OR WaitFor.selector('div.selector') OR WaitFor.networkIdle()
 * ---
 * @method `.timeout()` Static initializer. Receives a timeout value in miliseconds to wait for.
 * ---
 * @method `.selector()` Static initializer. Receives a selector to wait to be in the DOM and visible.
 * > `.upTo()` [optional] Additional method that can be used for waiting a maximum timeout in milliseconds to complete the whole step.
 * > E.g: WaitFor.selector('div.selector').upTo(5000)
 * > `.toBe()` [optional] Additional method that can be used for selector waiting.
 * > It can be either 'attached' | 'detached' | 'visible' | 'hidden'
 * > E.g: WaitFor.selector('div.selector').toBe('hidden')
 * ---
 * @method `.networkIdle()` Static initializer. It waits for the network to be idle to return. Receives an optional number of minimum connections to wait.
 * > `.upTo()` [optional] Additional method that can be used for waiting a maximum timeout in milliseconds to complete the whole step.
 * > E.g: WaitFor.selector('div.selector').upTo(5000)
 * > `.ignoring()` [optional] Additional method that can be used to ignore given request patterns if needed.
 * > E.g: WaitFor.networkIdle().ignoring(/\.svg/) OR WaitFor.networkIdle().ignoring([/\.svg/, /\.png/])
 */
export class WaitFor {
	private timeout: number

	/**
	 * E.g.: WaitFor.timeout(1500)
	 */
	public static timeout(timeout: number) {
		return new (class Timeout implements Interaction<void> {
			public async performAs({
				abilities: {
					browseTheWeb: { page }
				}
			}: User): Promise<void> {
				return page.waitForTimeout(timeout)
			}
		})()
	}

	/**
	 * E.g.: WaitFor.selector('div.selector')
	 * @method `.upTo()` [optional] Additional method that can be used for waiting a maximum timeout in milliseconds to complete the whole step.
	 * E.g: WaitFor.selector('div.selector').upTo(5000)
	 * @method `.toBe()` [optional] Additional method that can be used for selector waiting.
	 * It can be either 'attached' | 'detached' | 'visible' | 'hidden'
	 * E.g: WaitFor.selector('div.selector').toBe('hidden')
	 */
	public static selector(selector: string) {
		return new (class Selector extends WaitFor implements Interaction<ElementHandle> {
			private visibilityState: VisibilityState

			private text = ''

			public upTo(miliseconds: number): Selector {
				this.timeout = miliseconds
				return this
			}

			public toBe(state: VisibilityState): Selector {
				this.visibilityState = state
				return this
			}

			public withText(text: string): Selector {
				this.text = `:has-text('${text}')`
				return this
			}

			public async performAs({
				abilities: {
					browseTheWeb: { page }
				}
			}: User): Promise<ElementHandle> {
				return page.waitForSelector(selector + this.text, {
					state: this.visibilityState,
					timeout: this.timeout || actionTimeout
				})
			}
		})()
	}

	/**
	 * Optionally receives a number of minimum connections to wait. Default to 0.
	 * E.g.: WaitFor.networkIdle() OR WaitFor.networkIdle(2)
	 * @method `.upTo()` [optional] Additional method that can be used for waiting a maximum timeout in milliseconds to complete the whole step.
	 * E.g: WaitFor.networkIdle().upTo(5000)
	 * @method `.ignoring()` [optional] Additional method that can be used to ignore given request patterns if needed.
	 * E.g: WaitFor.networkIdle().ignoring(/\.svg/) OR WaitFor.networkIdle().ignoring([/\.svg/, /\.png/])
	 */
	public static networkIdle(minConnections = 0) {
		return new (class NetworkIdle extends WaitFor implements Interaction<void> {
			private requestsToIgnore: Array<RegExp> = []

			public upTo(miliseconds: number): NetworkIdle {
				this.timeout = miliseconds
				return this
			}

			public ignoring(requests: RegExp | Array<RegExp>): NetworkIdle {
				this.requestsToIgnore = requests instanceof RegExp ? [requests] : requests
				return this
			}

			public async performAs({ abilities: { browseTheWeb } }: User): Promise<void> {
				const filterIgnoredRequests = (activeRequestsMap: Array<string>): Array<string> => {
					const newActiveRequestsMap = activeRequestsMap
					for (const requestToIgnore of this.requestsToIgnore)
						for (const index in newActiveRequestsMap)
							if (requestToIgnore.test(newActiveRequestsMap[index])) newActiveRequestsMap[index] = null
					return newActiveRequestsMap.filter(item => item !== null)
				}
				return new Promise((resolve, reject) => {
					let activeRequestsMap = filterIgnoredRequests(browseTheWeb.getActiveRequestsMap())
					const timeoutId = setTimeout(
						() =>
							reject(
								new Error(
									'at WaitFor.networkIdle()' +
										`\nNetwork was not idle after ${this.timeout || navigationTimeout / 1000} seconds.` +
										`\nActive network requests: ${activeRequestsMap.length}` +
										'\nRequests list:' +
										`${activeRequestsMap.toString().replace(/^|,/g, '\n- ')}`
								)
							),
						this.timeout || navigationTimeout
					)
					browseTheWeb.page.waitForLoadState('load').then(() => {
						const intervalId = setInterval(async () => {
							activeRequestsMap = filterIgnoredRequests(browseTheWeb.getActiveRequestsMap())
							if (activeRequestsMap.length <= minConnections) {
								clearInterval(intervalId)
								clearTimeout(timeoutId)
								resolve()
							}
						}, 750)
					})
				})
			}
		})()
	}
}
