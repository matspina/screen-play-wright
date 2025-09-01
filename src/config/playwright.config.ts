import { PlaywrightTestConfig, devices, defineConfig } from '@playwright/test'
import { existsSync, readFileSync } from 'fs'

import { RUNNING_ARGS_FILE, RunningArgs } from '../core/environment-manager.js'
import { TIMEOUTS } from './default-constants.js'

let runningArgs: RunningArgs = {}

if (existsSync(RUNNING_ARGS_FILE)) {
	runningArgs = JSON.parse(readFileSync(RUNNING_ARGS_FILE, { encoding: 'utf-8' }))
}

const playwrightTestConfig = defineConfig({
	// Test suite options
	testDir: '../../',
	retries: Number(process.env.npm_config_retries) || runningArgs?.retries || 0,
	workers: Number(process.env.npm_config_workers) || runningArgs?.workers || 1,
	fullyParallel: true,
	outputDir: '../../playwright-report/assets',
	forbidOnly: !!process.env.CI,
	reportSlowTests: { max: 5, threshold: 150000 },
	updateSnapshots: process.env.CI
		? 'none'
		: process.env.npm_config_update_snapshots || runningArgs?.updateSnapshots
			? 'all'
			: 'missing',
	// Timeout for a single test to run (ms):
	timeout: 90000, // 90 seconds
	// Timeout for each expect call to be resolved (ms):
	expect: { timeout: TIMEOUTS.EXPECT },
	use: {
		// Timeouts (ms)
		navigationTimeout: TIMEOUTS.NAVIGATION,
		actionTimeout: TIMEOUTS.ACTION,

		// Browser options
		headless: !!process.env.npm_config_headless || !!process.env.IS_DOCKER,

		// Artifacts
		video: 'retain-on-failure'
	},
	projects: [
		{
			name: 'Global Setup',
			testMatch: /\/src\/config\/global-setup\.ts$/,
			teardown: 'Global Teardown'
		},
		{
			name: 'Global Teardown',
			testMatch: /\/src\/config\/global-teardown\.ts$/
		},
		{
			name: 'mobile',
			dependencies: ['Global Setup'],
			testIgnore:
				process.env.npm_config_profile?.toLowerCase() === 'desktop' || runningArgs?.profile?.toLowerCase() === 'desktop'
					? /.*/
					: [/.*desktop\.spec\.ts/],
			grepInvert: /\[DESKTOP-ONLY\]/,
			use: {
				...devices['iPhone 11']
			}
		},
		{
			name: 'desktop',
			dependencies: ['Global Setup'],
			testIgnore:
				process.env.npm_config_profile?.toLowerCase() === 'mobile' || runningArgs?.profile?.toLowerCase() === 'mobile'
					? /.*/
					: [/.*mobile\.spec\.ts/],
			grepInvert: /\[MOBILE-ONLY\]/,
			use: {
				...devices['Desktop Chrome']
			}
		}
	],
	reporter: [
		['list'],
		['html', { open: 'never', outputFolder: '../../playwright-report/report' }],
		['../core/project-running-filter']
	]
})

export default playwrightTestConfig as PlaywrightTestConfig
