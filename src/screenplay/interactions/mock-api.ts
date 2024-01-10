import { Activity } from '@activity'
import { User } from '@actors/user'

type Data = {
	status: number
	body: Record<string, unknown> | Array<unknown>
	headers: { [key: string]: string }
}

/**
 * Action to intercept and mock network requests.
 * E.g.: Mock.api('**\/test/v1/promotion').with(DATA)
 * @method `.api()` Static initializer. Receives the API endpoint to be mocked.
 * @method `.with()` Receives the DATA to be returned as the service response.
 * The DATA should be an object containing the following attributes: status<number>, body<object> and headers<object>.
 * For mock data examples, check files under the folder ./src/mocks
 */
export class Mock implements Activity<void> {
	private endpoint: string | RegExp

	private status: number

	private body: string

	private headers: { [key: string]: string }

	constructor(endpoint: string | RegExp) {
		this.endpoint = endpoint
	}

	public static api(endpoint: string | RegExp): Mock {
		return new Mock(endpoint)
	}

	public with(data: Data): Mock {
		this.status = data.status
		this.body = JSON.stringify(data.body)
		this.headers = data.headers
		return this
	}

	public async performAs(user: User): Promise<void> {
		return user.abilities.browseTheWeb.page.context().route(this.endpoint, route => {
			route.fulfill({
				status: this.status,
				body: this.body,
				headers: this.headers
			})
		})
	}
}
