import { Interaction } from '@interaction'

import { User } from '@actors/user'

import { Scroll } from '@interactions/scroll-to'
import { WaitFor } from '@interactions/wait-for'

type NumberBetween1To4 = 1 | 2 | 3 | 4

/**
 * Prepares the page for a full screenshot when the page is too tall and components rely on lazy loading.
 * It scrolls the view to the bottom and then to the top again to activate the components loading.
 * E.g.: PreparePageFor.fullScreenshot()
 * @method `.fullScreenshot()` Static initializer. Performs 1 round of scrolling.
 * @method `.withScrollingRoundsOf()` Sets a custom number for scrolling rounds. Valid values: 1 to 4.
 */
export class PreparePageFor implements Interaction<void> {
	private scrolls: NumberBetween1To4 = 1

	public static fullScreenshot(): PreparePageFor {
		return new PreparePageFor()
	}

	public withScrollingRoundsOf(scrolls: NumberBetween1To4): PreparePageFor {
		this.scrolls = scrolls
		return this
	}

	public async performAs(user: User): Promise<void> {
		for (let i = 0; i < this.scrolls; i += 1) {
			await user.attemptsTo(Scroll.to(10000))
			await user.attemptsTo(WaitFor.timeout(1000))
			await user.attemptsTo(Scroll.to(0))
			await user.attemptsTo(WaitFor.timeout(1000))
		}
		await user.attemptsTo(WaitFor.networkIdle())
		await user.attemptsTo(WaitFor.timeout(1000))
	}
}
