import { test as teardown } from '@playwright/test'
import colors from 'colors'

import { GenericIdentityFn, GlobalSetupAndTeardownOptions } from '../@types/general.js'

export class GlobalTeardown {
	public static async run(customFn: GenericIdentityFn, { enableLogs }: GlobalSetupAndTeardownOptions) {
		teardown('Global Teardown', async ({}) => {
			logger(colors.cyan('\nRunning Global Teardown'))

			if (customFn) await customFn()

			logger(colors.cyan('\nGlobal Teardown finished successfully'))
		})

		const logger = (message: string) => {
			if (enableLogs) console.log(message)
		}
	}
}
