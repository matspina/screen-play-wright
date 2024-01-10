/* eslint-disable @typescript-eslint/no-var-requires */
import glob from 'glob'
import path from 'path'

import { EnvironmentsMap } from './environment-manager'
import { SiteGlobalSetup } from './sites-global-setup'

interface SiteSetupType {
	[key: string]: unknown
	default: SiteGlobalSetup
}

interface EnvMapType {
	[key: string]: unknown
	default: EnvironmentsMap
}

export const dynamicallyImportSetupFiles = (): Array<SiteSetupType> => {
	const files = glob.sync('./src/config/*/**/*.setup.ts')
	const imports = []
	for (const file of files) {
		const imported = require(path.resolve(file))
		imports.push(imported)
	}
	return imports
}

export const dynamicallyImportEnvMap = (): Array<EnvMapType> => {
	const files = glob.sync('./src/config/*/**/environments-map.ts')
	const imports = []
	for (const file of files) {
		const imported = require(path.resolve(file))
		imports.push(imported)
	}
	return imports
}
