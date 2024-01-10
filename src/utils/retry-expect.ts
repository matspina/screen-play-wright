/* eslint-disable @typescript-eslint/no-explicit-any */

import playwrightTestConfig from '@config/playwright.config'

type GenericIdentityFn =
	| {
			(): Promise<unknown>
	  }
	| {
			(): unknown
	  }

type RetryOptions = {
	expectTimeout?: number
	retryInterval?: number
}

export default async (assertionMethod: GenericIdentityFn, options?: RetryOptions): Promise<any> => {
	const EXPECT_TIMEOUT = options?.expectTimeout || playwrightTestConfig.expect?.timeout || 5000
	const RETRY_INTERVAL = options?.retryInterval || 250
	const DEBUG = process.env.npm_config_debug

	let timeoutExceeded = false
	let attempts = 0

	const timeoutId = setTimeout(() => {
		timeoutExceeded = true
	}, EXPECT_TIMEOUT)

	const initialUptime = process.uptime() * 1000

	for (;;) {
		try {
			const response = await assertionMethod()
			clearTimeout(timeoutId)
			return response
		} catch (e) {
			if (timeoutExceeded) throw e
			if (DEBUG)
				console.log(
					`RETRY EXPECT: Attempt ${++attempts} failed. Waiting ${RETRY_INTERVAL}ms for next attempt.` +
						` / Timeout left: ${Math.ceil(initialUptime + EXPECT_TIMEOUT - process.uptime() * 1000)}ms`
				)
			await new Promise(resolve => {
				setTimeout(resolve, RETRY_INTERVAL)
			})
		}
	}
}
