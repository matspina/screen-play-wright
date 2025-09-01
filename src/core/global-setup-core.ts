import { test as setup } from '@playwright/test'
import colors from 'colors'
import { readFile } from 'fs/promises'

import { GenericIdentityFn, GlobalSetupAndTeardownOptions } from '../@types/general.js'
import { getPromiseState } from '../utils/get-promise-state.js'
import { dynamicallyImportSetupFiles } from './dynamically-import-files.js'
import { getEnvAndInstance, getNumberOfWorkers } from './environment-manager.js'
import { globalSetupSitesFile } from './project-running-filter.js'
import { SiteGlobalSetup } from './sites-global-setup.js'

const { env, instance } = getEnvAndInstance()

export class GlobalSetup {
	public static async run(customFn: GenericIdentityFn, { enableLogs }: GlobalSetupAndTeardownOptions) {
		setup('Global Setup', async ({}) => {
			logger(colors.cyan('\nRunning Global Setup'))
			logger(`\n   Tests will run against ${colors.yellow(`${env.toUpperCase()}${instance}`)} environment`)

			if (customFn) await customFn()
			await saveGlobalSetupStates()

			logger(colors.cyan('\nGlobal Setup finished successfully'))
			logger('\nRunning tests\n')
		})

		const logger = (message: string) => {
			if (enableLogs) console.log(message)
		}
	}
}

const saveGlobalSetupStates = async (): Promise<void> => {
	if (process.env.npm_config_skip_state === 'true') return

	const MAX_PARALLEL_SETUPS = getNumberOfWorkers()
	const sitesToSaveLoginStates: Array<SiteGlobalSetup> = []
	const sitesWithGlobalSetup = JSON.parse(
		await readFile(globalSetupSitesFile.path + globalSetupSitesFile.name, { encoding: 'utf-8' })
	)
	const sitesSetup = await dynamicallyImportSetupFiles()

	for (const siteSetup of sitesSetup) {
		const { storageStateFile } = siteSetup.default.properties
		if (sitesWithGlobalSetup.some(e => e === `PW_SITE_HAS_GLOBAL_SETUP:${storageStateFile}`))
			sitesToSaveLoginStates.push(siteSetup.default)
	}

	const firstBatchToRun = sitesToSaveLoginStates.splice(0, MAX_PARALLEL_SETUPS)
	const promisesToWait: Array<Promise<void>> = []
	let isAnySetupFulfilled: boolean

	for (const siteLoginSteps of firstBatchToRun) promisesToWait.push(siteLoginSteps.performGlobalSetupSteps())

	while (promisesToWait.length > 0) {
		await Promise.race(promisesToWait)
			.catch(error => {
				if (isAcceptableError(error)) {
					const MSG_01 =
						'   WARN: Looks like the above site is not configured properly to run the global setup on ' +
						`'${colors.bold(env)}'.`
					const MSG_02 = '   Is this test supposed to run on this environment?'
					const MSG_03 = `   Please, double check your environments-map file for the '${colors.bold(env)}' env.`
					const MSG_04 = '   The global setup will be skipped for this site but some tests may fail.'

					console.log(colors.yellow(MSG_01))
					console.log(colors.yellow(MSG_02))
					console.log(colors.red(`Original Error: ${error.stack}`).replace(/^/gm, '   '))
					console.log(colors.yellow(MSG_03))
					console.log(colors.yellow(MSG_04))
					console.log()
				} else throw error
			})
			.then(async () => {
				for (const index in promisesToWait) {
					if (promisesToWait[index]) {
						const promiseState = await getPromiseState(promisesToWait[index])
						if (promiseState !== 'pending') promisesToWait.splice(Number(index), 1)
						if (promiseState === 'fulfilled') isAnySetupFulfilled = true
					}
				}
				if (sitesToSaveLoginStates.length > 0)
					promisesToWait.push(sitesToSaveLoginStates.shift().performGlobalSetupSteps())
				if (promisesToWait.length === 0 && !isAnySetupFulfilled)
					throw Error('No global setup successed. Please check above for details.')
			})
	}

	function isAcceptableError(error: Error): boolean {
		return !!(
			error.message.includes('Invalid URL') ||
			error.message.includes('Cannot navigate to invalid URL') ||
			error.message.includes('expected string, got undefined')
		)
	}
}
