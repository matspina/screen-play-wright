import { Activity } from '@activity'
import { User } from '@actors/user'

import { FacebookSignIn, AvailableFacebookAccountNames } from '@page-objects/generics/facebook/sign-in-page'

import { Click } from '@interactions/click'
import { Navigate } from '@interactions/navigate'
import { Type } from '@interactions/type'
import { WaitFor } from '@interactions/wait-for'
import { IsPageUrl } from '@questions/generics/is-page-url-matching'

export class SignInAt implements Activity<void> {
	private accountToUse: AvailableFacebookAccountNames

	public static facebookAccount(accountToUse: AvailableFacebookAccountNames): SignInAt {
		return new SignInAt(accountToUse)
	}

	constructor(accountToUse: AvailableFacebookAccountNames) {
		this.accountToUse = accountToUse
	}

	public async performAs(user: User): Promise<void> {
		await user.attemptsTo(WaitFor.networkIdle())
		const accountDetails = FacebookSignIn.getFacebookAccountDetails(this.accountToUse)

		//
		// If user is NOT at Facebook sign-in screen > Navigate to Facebook sign-in URL
		//
		const isUserAtFacebookSignInScreen = await user.kindlyAsks(
			IsPageUrl.matching(/:\/\/www\.facebook\.com\//).waitingUpTo(1000)
		)
		if (!isUserAtFacebookSignInScreen)
			await user.attemptsTo(Navigate.to(FacebookSignIn.URL).andWaitUntil('networkidle'))
		await user.attemptsTo(Type.theFollowing(accountDetails.email).in(FacebookSignIn.SELECTORS.EMAIL_INPUT))
		await user.attemptsTo(Type.theFollowing(accountDetails.pass).in(FacebookSignIn.SELECTORS.PASS_INPUT))
		await user.attemptsTo(Click.on(FacebookSignIn.SELECTORS.SUBMIT_BUTTON))
		await user.attemptsTo(WaitFor.networkIdle())
	}
}
