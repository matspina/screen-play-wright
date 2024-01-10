export type AvailableGoogleAccountNames = 'test1' | 'test2'

interface GoogleAccountDetails {
	email: string
	pass: string
	userName: string
	recoveryEmail: string
}

export class GoogleSignIn {
	public static URL = 'https://accounts.google.com/AddSession'

	public static readonly SELECTORS = {
		WELCOME_TEXT: 'div > header > h1',
		SIGN_IN_SCREEN: {
			EMAIL_INPUT: 'input[type=email]',
			EMAIL_NEXT: '#identifierNext',
			PASSWORD_INPUT: 'input[type=password]',
			PASSWORD_NEXT: '#passwordNext'
		},
		PROMPT_SCREENS: {
			ACCOUNT_CHOOSE_LIST_ITEMS: 'form ul li',
			ACCOUNT_CHOOSE_1: 'form ul li >> nth=0',
			ACCOUNT_CHOOSE_2: 'form ul li >> nth=1',
			ACCOUNT_CHOOSE_ANOTHER_ACCOUNT: 'form ul li >> nth=-1',
			NOT_NOW_BUTTON: 'button:has-text("Not now")',
			VERIFY_ITS_YOU_HEADER: 'h1#headingText:has-text("Verify it’s you")',
			CONFIRM_RECOVERY_EMAIL_BUTTON: 'form ul li:has-text("Confirm your recovery email")',
			RECOVERY_EMAIL_INPUT: 'input#knowledge-preregistered-email-response',
			BUTTON_NEXT: 'button:has-text("next")'
		}
	}

	private static readonly availableAccounts = {
		test1: {
			email: 'test1@gmail.com',
			pass: 'Test@123',
			userName: 'Test 1',
			recoveryEmail: 'test2@gmail.com'
		},
		test2: {
			email: 'test2@gmail.com',
			pass: 'Test@123',
			userName: 'Test 2',
			recoveryEmail: 'test1@gmail.com'
		}
	}

	public static getGoogleAccountDetails(accountToUse: AvailableGoogleAccountNames): GoogleAccountDetails {
		return GoogleSignIn.availableAccounts[accountToUse]
	}
}
