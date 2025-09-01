import { BrowserContext, chromium, webkit } from '@playwright/test'
import colors from 'colors'
import { access, readFile, writeFile, mkdir } from 'fs/promises'
import { lock } from 'proper-lockfile'

import { Interaction } from '../@types/interaction.js'
import { Question } from '../@types/question.js'
import { BrowseTheWeb } from '../screenplay/abilities/browse-the-web.js'
import { User } from '../screenplay/actors/user.js'
import { getEnvAndInstance } from './environment-manager.js'

export interface GlobalSetupLoginSettings {
	user: User
	setupName: string
	testsPath: string
	actionSteps: Interaction<unknown>
	assertionSteps?: Question<unknown>
	storageStateFile?: string
	browserName?: 'chromium' | 'webkit'
	skipOnJenkins?: boolean // Select to skip the global setup on Jenkins
	forceHeadlessTo?: boolean // By default, headless is true, but it can be forced to false if needed by some setup file
	cacheGlobalSetupFor?: { minutes: number } // Time to cache the global setup state (default is 0 - No cache)
}

export class SiteGlobalSetup {
	constructor(args: GlobalSetupLoginSettings) {
		this.properties = {
			user: args.user,
			setupName: args.setupName,
			testsPath: args.testsPath,
			storageStateFile: args.storageStateFile,
			actionSteps: args.actionSteps,
			assertionSteps: args.assertionSteps,
			browserName: args.browserName || 'chromium',
			skipOnJenkins: args.skipOnJenkins,
			forceHeadlessTo: args.forceHeadlessTo,
			cacheGlobalSetupFor: args.cacheGlobalSetupFor
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

		if (isFileJustCreated || !this.properties.cacheGlobalSetupFor?.minutes) return true

		const fileContent = await readFile(ttlFilePath + ttlFileName, { encoding: 'utf8' })
		const fileParsed = JSON.parse(fileContent)
		const { storageStateFile } = this.properties

		if (fileParsed[storageStateFile]?.[this.env]?.lastExecutedAt) {
			const { lastExecutedAt } = fileParsed[storageStateFile][this.env]
			const currentTime = new Date().getTime()
			if (currentTime - lastExecutedAt > this.properties.cacheGlobalSetupFor.minutes * 60 * 1000) return true
		} else return true
		return false
	}

	private async saveCurrentTtl(): Promise<void> {
		const { path: ttlFilePath, name: ttlFileName } = this.globalSetupTTLFile
		lock(ttlFilePath + ttlFileName, { retries: { retries: 20, minTimeout: 250 } }).then(async releaseFile => {
			const fileContent = await readFile(ttlFilePath + ttlFileName, { encoding: 'utf8' })
			const fileParsed = JSON.parse(fileContent)
			const currentTime = new Date().getTime()
			const { storageStateFile } = this.properties

			if (fileParsed[storageStateFile]) {
				if (fileParsed[storageStateFile][this.env]) fileParsed[storageStateFile][this.env].lastExecutedAt = currentTime
				else fileParsed[storageStateFile][this.env] = { lastExecutedAt: currentTime }
			} else fileParsed[storageStateFile] = { [this.env]: { lastExecutedAt: currentTime } }

			await writeFile(ttlFilePath + ttlFileName, JSON.stringify(fileParsed))
			releaseFile()
		})
	}

	public async performGlobalSetupSteps(): Promise<void> {
		const { setupName, user, actionSteps, assertionSteps, storageStateFile, browserName } = this.properties

		const STATUS_MSG = {
			starting: () => `   # Saving ${setupName} setup state...`,
			retrying: () => `   Retrying ${currentRetry} of ${RETRIES}...`,
			error: () => `   Error on ${setupName} setup flow`,
			success: () => `   ${colors.green('✓')} ${setupName} setup state saved successfully`,
			cached: () => `   INFO: Using cached global setup state for ${setupName}`,
			skipped: () =>
				`   WARN: Global setup '${setupName}' SKIPPED due to condition: skipOnJenkins === true OR forceHeadlessTo === false`
		}

		if (process.env.CI && (this.properties.skipOnJenkins || this.properties.forceHeadlessTo === false)) {
			console.warn(STATUS_MSG.skipped())
			return
		}

		if (!(await this.isGlobalSetupExpired())) {
			console.info(STATUS_MSG.cached())
			return
		}

		const RETRIES = process.env.npm_config_debug ? 0 : 1
		const launchOptions = {
			headless:
				this.properties.forceHeadlessTo !== undefined
					? this.properties.forceHeadlessTo
					: !!process.env.npm_config_headless || !!process.env.IS_DOCKER
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
			await user.attemptsTo(actionSteps)
			// Assert sign-in state
			if (assertionSteps) await user.asks(assertionSteps)
			// Save storage state
			if (storageStateFile) await page.context().storageState({ path: storageStateFile })
			await this.saveCurrentTtl()
		}

		console.log(STATUS_MSG.starting())

		do {
			try {
				await runSteps()
				break
			} catch (err) {
				if (currentRetry >= RETRIES) {
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
				await context?.close()
			}
		} while (currentRetry <= RETRIES)

		console.log(STATUS_MSG.success())
	}
}
