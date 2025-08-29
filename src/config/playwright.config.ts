/* eslint-disable prettier/prettier */

import { devices } from '@playwright/test'
import { existsSync, readFileSync } from 'fs'

import { RUNNING_ARGS_FILE } from '../core/environment-manager'

let runningArgs = null

if (existsSync(RUNNING_ARGS_FILE)) {
	runningArgs = JSON.parse(readFileSync(RUNNING_ARGS_FILE, { encoding: 'utf-8' }))
}

const playwrightTestConfig = {
	// Test suite options
	testDir: '../../tests',
	globalSetup: '../core/global-setup.ts',
	globalTeardown: '../core/global-teardown.ts',
	retries: Number(process.env.npm_config_retries) || runningArgs?.retries,
	workers: Number(process.env.npm_config_workers) || runningArgs?.workers || 1,
	fullyParallel: true,
	outputDir: '../../playwright-report/assets',
	forbidOnly: !!process.env.CI,
	reportSlowTests: { max: 5, threshold: 150000 },
	updateSnapshots: process.env.CI ? 'none' : process.env.npm_config_update_snapshots || runningArgs?.updateSnapshots ? 'all' : 'missing',
	// Timeout for a single test to run (ms):
	timeout: 120000, // 2 minutes
	// Timeout for each expect call to be resolved (ms):
	expect: { timeout: 5000 },
	use: {
		// Timeouts (ms)
		navigationTimeout: 30000,
		actionTimeout: 15000,

		// Browser options
		headless: !!process.env.npm_config_headless || !!process.env.IS_DOCKER,

		// Artifacts
		video: 'retain-on-failure'
	},
	projects: [
		{
			name: 'mobile',
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
}

export default playwrightTestConfig
