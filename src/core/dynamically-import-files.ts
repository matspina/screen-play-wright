import { sync } from 'glob'
import path from 'path'

import { SiteGlobalSetup } from './sites-global-setup.js'

interface SiteSetupType {
	[key: string]: unknown
	default: SiteGlobalSetup
}

export const dynamicallyImportSetupFiles = async (): Promise<SiteSetupType[]> => {
	const files = sync('./src/config/*/**/*.setup.ts')
	const imports = []
	for (const file of files) {
		const imported = await import(path.resolve(file))
		imports.push(imported)
	}
	return imports
}
