export type AvailableFacebookAccountNames = 'test1'

interface FacebookAccountDetails {
	email: string
	pass: string
	userName: string
}

export class FacebookSignIn {
	public static URL = 'https://www.facebook.com/'

	public static readonly SELECTORS = {
		EMAIL_INPUT: 'input#email',
		PASS_INPUT: 'input#pass',
		SUBMIT_BUTTON: 'button[type=submit]',
		PROFILE_LINK: 'a[href="/me/"]'
	}

	private static readonly availableAccounts = {
		test1: {
			email: 'test1@gmail.com',
			pass: 'Test@123',
			userName: 'John Mitchel'
		}
	}

	public static getFacebookAccountDetails(accountToUse: AvailableFacebookAccountNames): FacebookAccountDetails {
		return FacebookSignIn.availableAccounts[accountToUse]
	}
}
