/* eslint-disable @typescript-eslint/ban-types */
import { Activity } from '@activity'
import { User } from '@actors/user'

/**
 * Action to run a javascript function in the browser context.
 * E.g.: RunJs.onBrowser('alert("testing")') OR RunJs.onBrowser(function)
 * @method `.onBrowser()` Static initializer. Receives the function to be run in the browser context.
 * It can be either a string or a JS function.
 */
export class RunJs implements Activity<unknown> {
	private jsFunction

	constructor(jsFunction: Function | string) {
		this.jsFunction = jsFunction
	}

	public static onBrowser(jsFunction: Function | string): RunJs {
		return new RunJs(jsFunction)
	}

	public async performAs(user: User): Promise<unknown> {
		return user.abilities.browseTheWeb.page.evaluate(this.jsFunction)
	}
}
