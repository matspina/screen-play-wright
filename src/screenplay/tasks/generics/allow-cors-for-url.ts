import { Activity } from '@activity'
import { User } from '@actors/user'

/**
 * Task to allow CORS per URL, by adding the header: 'Access-Control-Allow-Origin': '*'
 * Should be used before the page load.
 * E.g.: AllowCorsFor.url('**\/store/graphql*')
 */
export class AllowCorsFor implements Activity<void> {
	private url: string | RegExp

	constructor(url: string | RegExp) {
		this.url = url
	}

	public static url(url: string | RegExp): AllowCorsFor {
		return new AllowCorsFor(url)
	}

	public async performAs({
		abilities: {
			browseTheWeb: { page }
		}
	}: User): Promise<void> {
		await page.route(this.url, async route => {
			const request = route.request()
			const response = await page.request.fetch(request.url(), {
				method: request.method(),
				data: request.postData(),
				headers: {
					...(await request.allHeaders()),
					'Access-Control-Allow-Origin': '*'
				}
			})
			await route.fulfill({
				response
			})
		})
	}
}
