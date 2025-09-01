import { Interaction } from '@interaction'

import { User } from '@actors/user'

import { AvailableGoogleAccountNames, GoogleSignIn } from '@page-objects/generics/google/sign-in-page'

import { Click } from '@interactions/click'
import { Navigate } from '@interactions/navigate'
import { Type } from '@interactions/type'
import { WaitFor } from '@interactions/wait-for'
import { IsElement } from '@questions/generics/is-element'
import { IsPageUrl } from '@questions/generics/is-page-url-matching'
import { IsText } from '@questions/generics/is-text-matching'

export class SignInAt implements Interaction<void> {
	private accountToUse: AvailableGoogleAccountNames

	public static googleAccount(accountToUse: AvailableGoogleAccountNames): SignInAt {
		return new SignInAt(accountToUse)
	}

	constructor(accountToUse: AvailableGoogleAccountNames) {
		this.accountToUse = accountToUse
	}

	public async performAs(user: User): Promise<void> {
		const accountDetails = GoogleSignIn.getGoogleAccountDetails(this.accountToUse)
		await user.attemptsTo(WaitFor.networkIdle())

		//
		// If user is NOT at Google sign-in screen > Navigate to Google sign-in URL
		//
		const isUserAtGoogleSignInScreen = await user.kindlyAsks(
			IsPageUrl.matching(/:\/\/accounts\.google\.com.*\/[identifier|challenge/]/).waitingUpTo(500)
		)
		if (!isUserAtGoogleSignInScreen) await user.attemptsTo(Navigate.to(GoogleSignIn.URL).andWaitUntil('networkidle'))

		// Sign-in steps:
		const isEmailInputVisible = await user.kindlyAsks(
			IsElement.visible(GoogleSignIn.SELECTORS.SIGN_IN_SCREEN.EMAIL_INPUT).waitingUpTo(500)
		)
		if (isEmailInputVisible) {
			await user.attemptsTo(
				Type.theFollowing(accountDetails.email).in(GoogleSignIn.SELECTORS.SIGN_IN_SCREEN.EMAIL_INPUT)
			)
			await user.attemptsTo(Click.on(GoogleSignIn.SELECTORS.SIGN_IN_SCREEN.EMAIL_NEXT))
		}
		await user.attemptsTo(WaitFor.selector(GoogleSignIn.SELECTORS.SIGN_IN_SCREEN.PASSWORD_INPUT))
		await user.attemptsTo(
			Type.theFollowing(accountDetails.pass).in(GoogleSignIn.SELECTORS.SIGN_IN_SCREEN.PASSWORD_INPUT)
		)
		await user.attemptsTo(Click.on(GoogleSignIn.SELECTORS.SIGN_IN_SCREEN.PASSWORD_NEXT))
		await user.attemptsTo(WaitFor.networkIdle())

		//
		// If user is prompted to review his account settings > Click on "not now" button
		//
		const isNotNowButtonVisible = await user.kindlyAsks(
			IsElement.visible(GoogleSignIn.SELECTORS.PROMPT_SCREENS.NOT_NOW_BUTTON).waitingUpTo(500)
		)
		if (isNotNowButtonVisible) {
			await user.attemptsTo(Click.on(GoogleSignIn.SELECTORS.PROMPT_SCREENS.NOT_NOW_BUTTON))
			await user.attemptsTo(WaitFor.networkIdle())
		}

		//
		// If user is challenged to confirm the account owner > Click on "Confirm your recovery email" button and confirm it
		//
		const isGoogleChallengeUrl = await user.kindlyAsks(
			IsPageUrl.matching(/:\/\/accounts\.google\.com.*\/challenge\//).waitingUpTo(500)
		)
		const isChallengeHeaderVisible = await user.kindlyAsks(
			IsElement.visible(GoogleSignIn.SELECTORS.PROMPT_SCREENS.VERIFY_ITS_YOU_HEADER).waitingUpTo(500)
		)
		if (isGoogleChallengeUrl && isChallengeHeaderVisible) {
			await user.attemptsTo(Click.on(GoogleSignIn.SELECTORS.PROMPT_SCREENS.CONFIRM_RECOVERY_EMAIL_BUTTON))
			await user.attemptsTo(WaitFor.selector(GoogleSignIn.SELECTORS.PROMPT_SCREENS.RECOVERY_EMAIL_INPUT))
			await user.attemptsTo(
				Type.theFollowing(accountDetails.recoveryEmail).in(GoogleSignIn.SELECTORS.PROMPT_SCREENS.RECOVERY_EMAIL_INPUT)
			)
			await user.attemptsTo(Click.on(GoogleSignIn.SELECTORS.PROMPT_SCREENS.BUTTON_NEXT))
			await user.attemptsTo(WaitFor.networkIdle())
		}

		//
		// Final assert: If user is redirected to google myaccount homepage, confirm he is logged in
		// (It won't happen if you are logging in from an application, e.g.: From B2C sign-in page)
		//
		const isGoogleMyAccountOpen = await user.kindlyAsks(
			IsPageUrl.matching(/:\/\/myaccount\.google\.com/).waitingUpTo(500)
		)
		if (isGoogleMyAccountOpen)
			await user.asks(IsText.from(GoogleSignIn.SELECTORS.WELCOME_TEXT).matching(`Welcome, ${accountDetails.userName}`))
	}
}
