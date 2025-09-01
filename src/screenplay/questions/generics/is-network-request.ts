import { expect, Page } from '@playwright/test'
import { Question } from '@question'

import { User } from '@actors/user'

/**
 * Observer to get network requests and assert their existence.
 * E.g.: IsNetworkRequest.withUrl(/\.png$|\.jpg$/).notExisting()
 * @method `.withUrl()` Static initializer. Receives a regular expression (RegExp) to match the requests URL.
 * @method `.existing()` Asserts that the given request should exist.
 * @method `.notExisting()` Asserts that the given request should NOT exist.
 * @method `.containingThePayload()` Asserts that the given request contains the payload parameters and values passed.
 * @method `.matchingTheExactPayload()` Asserts that the given request has the exact payload object passed.
 */
export class IsNetworkRequest implements Question<Page> {
	private regexUrl: RegExp

	private shouldRequestExist: boolean

	private containingPayload: Record<string, unknown>

	private exactPayload: Record<string, unknown>

	constructor(regexUrl: RegExp) {
		this.regexUrl = regexUrl
	}

	public static withUrl(regexUrl: RegExp): IsNetworkRequest {
		return new IsNetworkRequest(regexUrl)
	}

	public existing(): IsNetworkRequest {
		this.shouldRequestExist = true
		return this
	}

	public notExisting(): IsNetworkRequest {
		this.shouldRequestExist = false
		return this
	}

	public containingThePayloadParameters(payload: Record<string, unknown>): IsNetworkRequest {
		this.containingPayload = payload
		return this
	}

	public matchingTheExactPayload(payload: Record<string, unknown>): IsNetworkRequest {
		this.exactPayload = payload
		return this
	}

	public async askAs(user: User): Promise<Page> {
		const requestsHistory = user.abilities.browseTheWeb.getRequestsHistory()
		for (const index in requestsHistory) {
			if (this.regexUrl.test(requestsHistory[index].url())) {
				if (this.containingPayload && requestsHistory[index].method() === 'POST') {
					const payload = requestsHistory[index].postDataJSON()
					expect(payload).toMatchObject(this.containingPayload)
				}
				if (this.exactPayload && requestsHistory[index].method() === 'POST') {
					const payload = requestsHistory[index].postDataJSON()
					expect(payload).toEqual(this.exactPayload)
				}
				if (this.shouldRequestExist === false) {
					const url = new URL(requestsHistory[index].url())
					expect(
						url.host + url.pathname + url.search + url.hash,
						`Expected NOT to contain network request with pattern ${this.regexUrl.toString()}`
					).toBeNull()
				}
				if (this.shouldRequestExist === true) return
			} else if (this.shouldRequestExist === true && Number(index) === requestsHistory.length - 1)
				expect(0, `Expected to contain network request with pattern ${this.regexUrl.toString()}`).toBeGreaterThan(0)
		}
	}
}
