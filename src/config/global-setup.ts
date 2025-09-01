import { GlobalSetup } from '../core/global-setup-core.js'

GlobalSetup.run(
	async () => {
		// Build here your custom global setup
		// It will be run before the sites global setup
	},
	{ enableLogs: true }
)
