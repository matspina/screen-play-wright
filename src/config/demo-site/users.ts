import { User } from '@actors/user'

export class RetrieveUserData {
	public static generic = () => User.named('Generic User')

	/**
	 * Example of email pattern to return: screen-pw@global-123456.cc
	 */
	public static withRandomEmail = async (randomDigits = 6) => {
		const randomEmail = `screen-pw@global-${Math.random().toString().slice(-randomDigits)}.cc`
		return User.named('Test User').withUsername(randomEmail).withPassword('Test@123')
	}

	/**
	 * This method creates a real temporary email address for the user, with the mailjs API
	 */
	public static withRandomTempEmailApi = async () => {
		const user = await User.named('Test User').withPassword('Test@123').usingMailjs()
		return user
	}
}
