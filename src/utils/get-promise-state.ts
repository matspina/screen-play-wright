export const getPromiseState = async (promise: Promise<unknown>): Promise<'pending' | 'fulfilled' | 'rejected'> => {
	const pendingAssertion = {}
	return Promise.race([promise, pendingAssertion]).then(
		result => (result === pendingAssertion ? 'pending' : 'fulfilled'),
		() => 'rejected'
	)
}
