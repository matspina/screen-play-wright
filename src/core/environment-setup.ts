/* eslint-disable complexity */

import colors from 'colors'
import { existsSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'
import inquirer from 'inquirer'

import { VALID_ENVIRONMENTS, RUNNING_ARGS_FILE, RunningArgs } from './environment-manager.js'

const main = async (): Promise<void> => {
	let runningArgs: RunningArgs = {
		envAndInstance: '',
		additionalArgs: false,
		profile: process.env.npm_config_profile?.toLowerCase() || '',
		updateSnapshots: !!process.env.npm_config_update_snapshots,
		retries: Number(process.env.npm_config_retries) || 0,
		workers: Number(process.env.npm_config_workers) || 1
	}
	let shouldPromptUser: boolean

	if (!process.env.npm_config_env) {
		shouldPromptUser = true

		if (existsSync(RUNNING_ARGS_FILE)) {
			runningArgs = JSON.parse(await readFile(RUNNING_ARGS_FILE, { encoding: 'utf-8' }))
		}

		runningArgs.envAndInstance = (
			await inquirer.prompt({
				name: 'envAndInstance',
				type: 'input',
				validate: envAndInstance => {
					if (envAndInstance === 'help') {
						console.log(`\n\nOptions: ${colors.cyan(VALID_ENVIRONMENTS.join(' | '))}\n`)
						console.log('Some experiences may have more than one instance for the same environment.')
						console.log('In these cases, it is possible to provide the instance number as well.\n')
						console.log(`Example: ${colors.cyan('uat2')}\n`)
						console.log(
							'Note: If no instance number is specified, the first one will be considered for each experience.'
						)
						console.log(
							'If the specified number does not exist for some given experience, the first instance will be considered for this experience.\n'
						)
						return false
					}
					return true
				},
				message: 'Enter the environment (type "help" for instructions):',
				default: runningArgs.envAndInstance
			})
		).envAndInstance
	} else runningArgs.envAndInstance = process.env.npm_config_env

	const instanceSplitter = /(?<=\D)(?=\d)/
	let [env, instance] = runningArgs.envAndInstance.split(instanceSplitter)
	env = env.toLowerCase()
	instance = instance || ''

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	if (!VALID_ENVIRONMENTS.includes(env as any)) {
		console.log(`${colors.red.bold('Error:')} ${colors.yellow(env)} environment argument is not a valid option.\n`)
		console.log('Please choose one of the following:\n')
		console.log(`${colors.cyan(VALID_ENVIRONMENTS.join(' | '))}\n`)
		process.exit(1)
	}

	const instanceChecker = /^\d+$/

	if (instance && !instanceChecker.test(instance)) {
		console.log(`${colors.red.bold('Error:')} ${colors.yellow(instance)} is not a valid environment number.\n`)
		console.log('When providing environment number, please use the following format: [env][number]\n')
		console.log(`Example: ${colors.green('qa2')}\n`)
		process.exit(1)
	}

	if (shouldPromptUser) {
		runningArgs.additionalArgs = (
			await inquirer.prompt({
				name: 'additionalArgs',
				type: 'confirm',
				message: 'Include optional parameters?',
				default: runningArgs.additionalArgs
			})
		).additionalArgs

		if (runningArgs.additionalArgs) {
			runningArgs.profile = (
				await inquirer.prompt({
					name: 'profile',
					type: 'list',
					message: '  >  Profile:',
					choices: ['Both', 'Desktop', 'Mobile'],
					default: runningArgs.profile
				})
			).profile

			runningArgs.updateSnapshots = (
				await inquirer.prompt({
					name: 'updateSnapshots',
					type: 'confirm',
					message: '  >  Update snapshots?',
					default: runningArgs.updateSnapshots
				})
			).updateSnapshots

			runningArgs.retries = (
				await inquirer.prompt({
					name: 'retries',
					type: 'number',
					message: '  >  Number of retries:',
					default: runningArgs.retries || 0
				})
			).retries

			runningArgs.workers = (
				await inquirer.prompt({
					name: 'workers',
					type: 'number',
					message: '  >  Number of workers:',
					default: runningArgs.workers || 1
				})
			).workers
		} else {
			runningArgs.profile = ''
			runningArgs.updateSnapshots = false
			runningArgs.retries = 0
			runningArgs.workers = 1
		}
	}

	await writeFile(RUNNING_ARGS_FILE, JSON.stringify(runningArgs))
}

main()
