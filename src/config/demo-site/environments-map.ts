import { sessionSitesListBuilder, EnvironmentsMap } from '../../core/environment-manager'

const environmentsMap: EnvironmentsMap = {
	experienceName: 'DEMO SITE',
	experiencePath: '/tests/demo-site/',
	baseEnvironmentData: {
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
}

export default environmentsMap
export const getSessionSitesList = (): Record<string, string> => {
	return sessionSitesListBuilder(environmentsMap.baseEnvironmentData)
}
