import { Reporter, Suite } from '@playwright/test/reporter'

import { dynamicallyImportSetupFiles, dynamicallyImportEnvMap } from './dynamically-import-files'

const environmentsMaps = dynamicallyImportEnvMap()
const sitesSetup = dynamicallyImportSetupFiles()
const sitesProperties = []
for (const siteSetup of sitesSetup) {
	sitesProperties.push(siteSetup.default.properties)
}

export default class ProjectRunningFilter implements Reporter {
	onBegin(_config: unknown, suite: Suite): void {
		const allTests = suite.allTests()
		allTests.forEach(test => {
			const testPath = test.location.file.replace(/\\/g, '/')
			//
			// This first filter is for the project/experience - Useful to inform in logs which project is running
			for (const environmentsMap of environmentsMaps) {
				const { experienceName, experiencePath } = environmentsMap.default
				if (testPath.includes(experiencePath)) process.env[`PW_PROJECT_RUNNING_${experienceName}`] = 'true'
			}
			//
			// This second filter is for each site running - Useful to filter the global setup steps
			if (this.shouldTestBeConsidered(test)) {
				for (const siteProperties of sitesProperties) {
					if (testPath.includes(siteProperties.testsPath))
						process.env[`PW_SITE_HAS_GLOBAL_SETUP_${siteProperties.experienceName}_${siteProperties.siteName}`] = 'true'
				}
			}
		})
	}

	private shouldTestBeConsidered(test) {
		if (
			test.expectedStatus === 'skipped' ||
			test.annotations.filter(obj => ['skip', 'fixme'].includes(obj.type)).length > 0
		)
			return false

		let parentSuite = test.parent
		let hasStorageState = false
		while (parentSuite) {
			if (parentSuite._annotations.filter(obj => ['skip', 'fixme'].includes(obj.type)).length > 0) return false
			if (parentSuite._use.filter(obj => obj?.fixtures?.storageState).length > 0) hasStorageState = true
			parentSuite = parentSuite.parent
		}
		return hasStorageState
	}
}
