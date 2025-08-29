import 'tsconfig-paths/register'
import colors from 'colors'

import { getPromiseState } from '@utils/get-promise-state'

import playwrightTestConfig from '../config/playwright.config'
import { dynamicallyImportSetupFiles, dynamicallyImportEnvMap } from './dynamically-import-files'
import { getEnvAndInstance, getSessionEnvironmentData } from './environment-manager'
import { SiteGlobalSetup } from './sites-global-setup'

export default async (): Promise<void> => {
	console.log(colors.cyan('\nRunning Global Setup'))

	informExperiencesRunning()
	await saveLoginStates()

	console.log(colors.cyan('\nGlobal Setup finished successfully'))
	console.log('\nRunning tests\n')
}

const informExperiencesRunning = (): void => {
	const environmentsMaps = dynamicallyImportEnvMap()
	const { env } = getEnvAndInstance()

	console.log(`\n   Tests will run against ${colors.yellow(env.toUpperCase())} environment, for:`)

	for (const environmentsMap of environmentsMaps) {
		const { experienceName, baseEnvironmentData } = environmentsMap.default
		if (process.env[`PW_PROJECT_RUNNING_${experienceName}`]) {
			const { experienceInstance } = getSessionEnvironmentData(baseEnvironmentData)
			console.log(`      - ${experienceName} instance: ${colors.yellow(experienceInstance)}`)
		}
	}
}

const saveLoginStates = async (): Promise<void> => {
	if (process.env.npm_config_skip_state === 'true') return

	const MAX_PARALLEL_SETUPS = playwrightTestConfig.workers as number
	const sitesToSaveLoginStates: Array<SiteGlobalSetup> = []
	const sitesSetup = dynamicallyImportSetupFiles()
	const { env } = getEnvAndInstance()

	for (const siteSetup of sitesSetup) {
		const { experienceName, siteName } = siteSetup.default.properties
		if (process.env[`PW_SITE_HAS_GLOBAL_SETUP_${experienceName}_${siteName}`]) {
			sitesToSaveLoginStates.push(siteSetup.default)
		}
	}

	const firstBatchToRun = sitesToSaveLoginStates.splice(0, MAX_PARALLEL_SETUPS)
	const promisesToWait: Array<Promise<void>> = []
	let isAnySetupFulfilled: boolean

	for (const siteLoginSteps of firstBatchToRun) promisesToWait.push(siteLoginSteps.performSetupSteps())

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
				if (sitesToSaveLoginStates.length > 0) promisesToWait.push(sitesToSaveLoginStates.shift().performSetupSteps())
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
