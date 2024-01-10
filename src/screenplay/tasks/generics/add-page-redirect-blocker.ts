import { Dialog } from '@playwright/test'

import { Activity } from '@activity'
import { User } from '@actors/user'

/**
 * Blocks or unblocks the page redirect. Useful to assert things before the page unload.
 * E.g.: AddPageRedirect.blocker()
 * @method `.blocker()` Static initializer. Blocks the page redirect if a navigation is about to happen.
 * @method `.unblocker()` Static initializer. Unblocks the page redirect in the case it was blocked previously.
 */
export class AddPageRedirect implements Activity<void> {
	private action: string

	constructor(action: string) {
		this.action = action
	}

	public static blocker(): AddPageRedirect {
		return new AddPageRedirect('block')
	}

	public static unblocker(): AddPageRedirect {
		return new AddPageRedirect('unblock')
	}

	private async dismissDialogListener(dialog: Dialog): Promise<void> {
		try {
			await dialog.dismiss()
		} catch (e) {
			if (
				!(e.message.includes('Target page, context or browser has been closed') || e.message.includes('Target closed'))
			)
				throw e
		}
	}

	public async performAs(user: User): Promise<void> {
		if (this.action === 'block') {
			user.abilities.browseTheWeb.page.on('dialog', this.dismissDialogListener)
			return user.abilities.browseTheWeb.page.evaluate(() => {
				window.onbeforeunload = () => true
			})
		}
		if (this.action === 'unblock') {
			user.abilities.browseTheWeb.page.removeListener('dialog', this.dismissDialogListener)
			return user.abilities.browseTheWeb.page.evaluate(() => {
				window.onbeforeunload = null
			})
		}
	}
}
