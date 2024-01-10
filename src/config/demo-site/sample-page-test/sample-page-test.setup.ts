import 'tsconfig-paths/register'

import { Activity } from '@activity'

import { SamplePageTest } from '@page-objects/demo-site/sample-page-test'

import { Navigate } from '@interactions/navigate'

import { SiteGlobalSetup } from '../../../core/sites-global-setup'
import { RetrieveUserData } from '../users'

class NavigateAndSignIn implements Activity<void> {
	public static onCurrentPage = (): NavigateAndSignIn => new NavigateAndSignIn()

	public async performAs(): Promise<void> {
		await user.attemptsTo(Navigate.to(SamplePageTest.URL).andWaitUntil('networkidle'))
		//
		// // Perform further steps to conclude the global setup
		// await user.attemptsTo(SignIn.onCurrentPage())
	}
}

export const user = RetrieveUserData.generic()
export default new SiteGlobalSetup({
	user,
	experienceName: 'DEMO SITE',
	siteName: 'Sample Page Test',
	testsPath: '/tests/demo-site/sample-page-test/',
	storageStateFile: './browser-states/demo-sample-page-auth-state.json',
	signInSteps: NavigateAndSignIn.onCurrentPage(),
	globalSetupTtl: 20
})
