import { Reporter, Suite } from '@playwright/test/reporter'
import { writeFile, mkdir } from 'fs/promises'

import { dynamicallyImportSetupFiles } from './dynamically-import-files.js'

export const globalSetupSitesFile = {
	path: './browser-states/setup/',
	name: 'sitesWithGlobalSetup.temp.json'
}

export default class ProjectRunningFilter implements Reporter {
	async onBegin(_config: unknown, suite: Suite): Promise<void> {
		const sitesProperties = []
		const sitesWithGlobalSetup = []
		for (const siteSetup of await dynamicallyImportSetupFiles()) {
			sitesProperties.push(siteSetup.default.properties)
		}

		const allTests = suite.allTests()
		allTests.forEach(test => {
			const testPath = test.location.file.replace(/\\/g, '/')

			// This filter is for each site running - Useful to filter the global setup steps
			for (const siteProperties of sitesProperties) {
				if (testPath.includes(siteProperties.testsPath)) {
					const { storageStateFile } = siteProperties
					const testStorageState = this.filterTestWithGlobalSetup(test)
					if (testStorageState === storageStateFile)
						sitesWithGlobalSetup.push(`PW_SITE_HAS_GLOBAL_SETUP:${storageStateFile}`)
				}
			}
		})

		await writeFile(globalSetupSitesFile.path + globalSetupSitesFile.name, JSON.stringify(sitesWithGlobalSetup)).catch(
			async error => {
				if (error.code === 'ENOENT') {
					await mkdir(globalSetupSitesFile.path, { recursive: true })
					await writeFile(globalSetupSitesFile.path + globalSetupSitesFile.name, JSON.stringify(sitesWithGlobalSetup))
				} else throw error
			}
		)
	}

	private filterTestWithGlobalSetup(test) {
		if (
			test.expectedStatus === 'skipped' ||
			test.annotations.filter(obj => ['skip', 'fixme'].includes(obj.type)).length > 0
		)
			return false

		let parentSuite = test.parent
		let storageState
		while (parentSuite) {
			if (parentSuite._staticAnnotations.filter(obj => ['skip', 'fixme'].includes(obj.type)).length > 0) return false
			parentSuite._use.forEach(obj => {
				if (obj?.fixtures?.storageState) storageState = obj?.fixtures?.storageState
			})
			parentSuite = parentSuite.parent
		}
		return storageState
	}
}
