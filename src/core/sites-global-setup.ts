import { BrowserContext, chromium, webkit } from '@playwright/test'
import colors from 'colors'
import { access, readFile, writeFile, mkdir } from 'fs/promises'
import { lock } from 'proper-lockfile'

import { BrowseTheWeb } from '@abilities/browse-the-web'
import { Activity } from '@activity'
import { User } from '@actors/user'

import { Question } from '@questions/question'

import { getEnvAndInstance } from './environment-manager'

export interface GlobalSetupLoginSettings {
	user: User
	experienceName: string
	siteName: string
	testsPath: string
	storageStateFile: string
	signInSteps: Activity<unknown>
	signInAssertion?: Question<unknown>
	browserName?: 'chromium' | 'webkit'
	skipOnJenkins?: boolean // Select to skip the global setup on Jenkins
	forceHeadlessTo?: boolean // By default, headless is true, but it can be forced to false if needed by some setup file
	globalSetupTtl?: number // Time in minutes to cache the global setup state (default is 0 - No cache)
}

export class SiteGlobalSetup {
	constructor(args: GlobalSetupLoginSettings) {
		this.properties = {
			user: args.user,
			experienceName: args.experienceName,
			siteName: args.siteName,
			testsPath: args.testsPath,
			storageStateFile: args.storageStateFile,
			signInSteps: args.signInSteps,
			signInAssertion: args.signInAssertion,
			browserName: args.browserName || 'chromium',
			skipOnJenkins: args.skipOnJenkins,
			forceHeadlessTo: args.forceHeadlessTo,
			globalSetupTtl: args.globalSetupTtl || 0
		}
	}

	public readonly properties: GlobalSetupLoginSettings

	private readonly globalSetupTTLFile = {
		path: './browser-states/ttl/',
		name: 'globalSetupTTL.json'
	}

	private readonly env = getEnvAndInstance().env

	private async isGlobalSetupExpired(): Promise<boolean> {
		const { path: ttlFilePath, name: ttlFileName } = this.globalSetupTTLFile
		const isFileJustCreated = await access(ttlFilePath + ttlFileName).catch(async error1 => {
			if (error1.code === 'ENOENT') {
				await writeFile(ttlFilePath + ttlFileName, '{}').catch(async error2 => {
					if (error2.code === 'ENOENT') {
						await mkdir(ttlFilePath, { recursive: true })
						await writeFile(ttlFilePath + ttlFileName, '{}')
					} else throw error2
				})
			} else throw error1
			return true
		})

		if (isFileJustCreated || this.properties.globalSetupTtl === 0) return true

		const fileContent = await readFile(ttlFilePath + ttlFileName, { encoding: 'utf8' })
		const fileParsed = JSON.parse(fileContent)
		const { experienceName, siteName } = this.properties

		if (fileParsed[experienceName + siteName]?.[this.env]?.lastExecutedAt) {
			const { lastExecutedAt } = fileParsed[experienceName + siteName][this.env]
			const currentTime = new Date().getTime()
			if (currentTime - lastExecutedAt > this.properties.globalSetupTtl * 60 * 1000) return true
		} else return true
		return false
	}

	private async saveCurrentTtl(): Promise<void> {
		const { path: ttlFilePath, name: ttlFileName } = this.globalSetupTTLFile
		lock(ttlFilePath + ttlFileName, { retries: { retries: 20, minTimeout: 250 } }).then(async releaseFile => {
			const fileContent = await readFile(ttlFilePath + ttlFileName, { encoding: 'utf8' })
			const fileParsed = JSON.parse(fileContent)
			const currentTime = new Date().getTime()
			const { experienceName, siteName } = this.properties

			if (fileParsed[experienceName + siteName]) {
				if (fileParsed[experienceName + siteName][this.env])
					fileParsed[experienceName + siteName][this.env].lastExecutedAt = currentTime
				else fileParsed[experienceName + siteName][this.env] = { lastExecutedAt: currentTime }
			} else fileParsed[experienceName + siteName] = { [this.env]: { lastExecutedAt: currentTime } }

			await writeFile(ttlFilePath + ttlFileName, JSON.stringify(fileParsed))
			releaseFile()
		})
	}

	public async performLoginSteps(): Promise<void> {
		const { experienceName, siteName, user, signInSteps, signInAssertion, storageStateFile, browserName } =
			this.properties

		const STATUS_MSG = {
			starting: () => `   # Saving ${experienceName} > ${siteName} login state...`,
			retrying: () => `   Retrying ${currentRetry} of ${LOGIN_RETRIES}...`,
			error: () => `   Error on ${experienceName} > ${siteName} login flow`,
			success: () => `   ${colors.green('✓')} ${experienceName} > ${siteName} login state saved successfully`,
			cached: () => `   INFO: Using cached global setup state for ${experienceName} > ${siteName}`,
			skipped: () =>
				`   WARN: Global setup '${siteName}' SKIPPED due to condition: skipOnJenkins === true OR forceHeadlessTo === false`
		}

		if (process.env.CI && (this.properties.skipOnJenkins || this.properties.forceHeadlessTo === false)) {
			console.warn(STATUS_MSG.skipped())
			return
		}

		if (!(await this.isGlobalSetupExpired())) {
			console.info(STATUS_MSG.cached())
			return
		}

		const HEADLESS =
			this.properties.forceHeadlessTo !== undefined
				? this.properties.forceHeadlessTo
				: !!process.env.npm_config_headless || process.env.npm_config_headless === undefined
		const LOGIN_RETRIES = !HEADLESS || process.env.npm_config_debug ? 0 : 2
		const launchOptions = {
			headless: HEADLESS
		}
		let currentRetry = 0
		let context: BrowserContext

		const runSteps = async (): Promise<void> => {
			// To debug these steps if needed, just use the argument --headless=false
			if (browserName === 'chromium')
				context = await chromium.launchPersistentContext('', {
					...launchOptions,
					args: ['--disable-blink-features=AutomationControlled']
				})
			if (browserName === 'webkit') context = await webkit.launchPersistentContext('', launchOptions)
			const page = context.pages()[0]
			user.can(BrowseTheWeb.with(page))
			// Sign-in steps
			await user.attemptsTo(signInSteps)
			// Assert sign-in state
			if (signInAssertion) await user.asks(signInAssertion)
			// Save storage state
			await page.context().storageState({ path: storageStateFile })
			await this.saveCurrentTtl()
		}

		console.log(STATUS_MSG.starting())

		do {
			try {
				await runSteps()
				break
			} catch (err) {
				if (currentRetry >= LOGIN_RETRIES) {
					console.log()
					console.log(colors.red(STATUS_MSG.error()))
					console.log()
					throw err
				}
				currentRetry++
				console.log()
				console.log(colors.yellow(STATUS_MSG.error()))
				console.log(colors.yellow(STATUS_MSG.retrying()))
				console.log()
			} finally {
				await context.close()
			}
		} while (currentRetry <= LOGIN_RETRIES)

		console.log(STATUS_MSG.success())
	}
}
