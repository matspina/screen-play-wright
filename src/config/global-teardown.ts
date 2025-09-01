import { GlobalTeardown } from '../core/global-teardown-core.js'

GlobalTeardown.run(
	async () => {
		// Build here your custom global teardown
		// It will be run after all tests are completed
	},
	{ enableLogs: false }
)
