import { readFileSync } from 'fs'

export const VALID_ENVIRONMENTS = ['dev', 'qa', 'uat', 'prod'] as const
export const RUNNING_ARGS_FILE = 'src/utils/runningArgs.json'

export type BaseEnvironmentData = {
	[env in (typeof VALID_ENVIRONMENTS)[number]]?: {
		[instance: number]: {
			[site: string]: {
				url: `${'http://' | 'https://'}${string}`
				usernameAuth?: string
				passwordAuth?: string
			}
		}
	}
}

export type EnvironmentsMap = {
	experienceName: string
	experiencePath: string
	baseEnvironmentData: BaseEnvironmentData
}

export const sessionSitesListBuilder = (baseEnvironmentData: BaseEnvironmentData): Record<string, string> => {
	const { sites: baseSites } = getSessionEnvironmentData(baseEnvironmentData)
	if (!baseSites) return {}
	const sites = JSON.parse(JSON.stringify(baseSites))

	for (const site in sites) {
		if (Object.prototype.hasOwnProperty.call(sites, site)) {
			sites[site].finalUrl = new URL(sites[site].url)

			if (sites[site].usernameAuth) sites[site].finalUrl.username = sites[site].usernameAuth
			if (sites[site].passwordAuth) sites[site].finalUrl.password = sites[site].passwordAuth

			sites[site] = sites[site].finalUrl.toString()
		}
	}

	return sites
}

export const getSessionEnvironmentData = (baseEnvironmentData: BaseEnvironmentData): Record<string, string> => {
	const { env, instance } = getEnvAndInstance()
	if (!baseEnvironmentData[env]) return { env: 'NONE', experienceInstance: 'NONE' }
	const { commonUsernameSecretKey, commonPasswordSecretKey } = baseEnvironmentData[env]
	const experienceInstance = baseEnvironmentData[env][instance] ? instance : '1'
	const sites = baseEnvironmentData[env][experienceInstance] || {}
	return { env, experienceInstance, sites, commonUsernameSecretKey, commonPasswordSecretKey }
}

export const getEnvAndInstance = (): Record<string, string> => {
	if (!process.env.npm_config_env && !process.env.CI)
		process.env.npm_config_env = JSON.parse(readFileSync(RUNNING_ARGS_FILE, { encoding: 'utf-8' })).envAndInstance
	const instanceSplitter = /(?<=\D)(?=\d)/
	const [env, instance] = process.env.npm_config_env.split(instanceSplitter)
	return { env: env.toLowerCase(), instance: instance || '' }
}
