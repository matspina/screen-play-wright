import { Interaction } from '@interaction'

import { SamplePageTest } from '@page-objects/demo-site/sample-page-test'

import { Navigate } from '@interactions/navigate'

import { SiteGlobalSetup } from '../../../core/sites-global-setup'
import { RetrieveUserData } from '../users'

class NavigateAndSignIn implements Interaction<void> {
	public static onCurrentPage = (): NavigateAndSignIn => new NavigateAndSignIn()

	public async performAs(): Promise<void> {
		await user.attemptsTo(Navigate.to(SamplePageTest.URL).andWaitUntil('networkidle'))
		//
		// // Perform further steps to improve the global setup
		// E.g.: await user.attemptsTo(SignIn.onCurrentPage())
	}
}

export const user = RetrieveUserData.generic()
export default new SiteGlobalSetup({
	user,
	setupName: 'DEMO SITE: Sample Page Test',
	testsPath: '/tests/demo-site/sample-page-test/',
	storageStateFile: './browser-states/demo-sample-page-cached-state.json',
	actionSteps: NavigateAndSignIn.onCurrentPage(),
	cacheGlobalSetupFor: { minutes: 5 }
})
