import { Interaction } from '@interaction'

import { User } from '@actors/user'

type MouseButton = 'middle' | 'left' | 'right'

/**
 * Action to click on elements.
 * E.g.: Click.on('div.selector')
 * @method `.on()` Static initializer. Receives a selector to be clicked.
 * @method `.withButton()` [optional] Specifies a mouse button to click (left, middle or right).
 * @method `.andNotWait()` [optional] By default, when a click occurs, Playwright waits for a navigation.
 * If you don't want to wait, use this method.
 * @method `.andAttachFile()` [optional] Attach a file when a file chooser appears after a click.
 */
export class Click implements Interaction<void> {
	private selector: string

	private button: MouseButton = 'left'

	private noWait = false

	private fileToAttach: string

	private frameLocator: string

	constructor(selector: string) {
		this.selector = selector
	}

	public static on(selector: string): Click {
		return new Click(selector)
	}

	public withButton(button: MouseButton): Click {
		this.button = button
		return this
	}

	public withText(text: string): Click {
		this.selector += `:has-text('${text}')`
		return this
	}

	public andNotWait(): Click {
		this.noWait = true
		return this
	}

	public andAttachFile(file: string): Click {
		this.fileToAttach = file
		return this
	}

	public fromIframe(frameLocator: string): Click {
		this.frameLocator = frameLocator
		return this
	}

	public async performAs(user: User): Promise<void> {
		if (this.fileToAttach) {
			const [fileChooser] = await Promise.all([
				user.abilities.browseTheWeb.page.waitForEvent('filechooser'),
				user.abilities.browseTheWeb.page.locator(this.selector).click({ button: this.button, noWaitAfter: this.noWait })
			])
			return fileChooser.setFiles(this.fileToAttach, { noWaitAfter: this.noWait })
		}
		if (this.frameLocator) {
			return user.abilities.browseTheWeb.page.frameLocator(this.frameLocator).locator(this.selector).click({
				button: this.button,
				noWaitAfter: this.noWait
			})
		}
		return user.abilities.browseTheWeb.page.click(this.selector, {
			button: this.button,
			noWaitAfter: this.noWait
		})
	}
}
