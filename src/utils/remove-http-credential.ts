export const removeHttpCredential = (url: string | URL): string | URL => {
	const urlWithoutCredential = new URL(url)
	urlWithoutCredential.username = ''
	urlWithoutCredential.password = ''
	return url instanceof URL ? urlWithoutCredential : urlWithoutCredential.toString()
}
