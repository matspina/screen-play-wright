import { sessionSitesListBuilder, BaseEnvironmentData } from '../core/environment-manager'

const environmentsMap: BaseEnvironmentData = {
	dev: {
		1: {
			demoSite: {
				url: 'https://www.globalsqa.com/'
			}
		}
	},
	qa: {
		1: {
			demoSite: {
				url: 'https://www.globalsqa.com/'
			}
		}
	},
	uat: {
		1: {
			demoSite: {
				url: 'https://www.globalsqa.com/'
			}
		}
	},
	prod: {
		1: {
			demoSite: {
				url: 'https://www.globalsqa.com/'
			}
		}
	}
}

export const getSessionSitesList = (): Record<string, string> => {
	return sessionSitesListBuilder(environmentsMap)
}
