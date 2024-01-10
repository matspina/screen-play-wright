import { Activity } from '@activity'
import { User } from '@actors/user'

/**
 * Performs a mouse wheel rolling action for selected position (X = horizontally, Y = vertically).
 * NOTE: ONLY WORKS IN DESKTOP.
 * E.g.: MouseWheelRoll.to(0, 200)
 * @method `.to()` Static initializer. Receives a position to roll, where X = horizontally and Y = vertically.
 */
export class MouseWheelRoll implements Activity<void> {
	private deltaX: number

	private deltaY: number

	constructor(deltaX: number, deltaY: number) {
		this.deltaX = deltaX
		this.deltaY = deltaY
	}

	public static to(deltaX: number, deltaY: number): MouseWheelRoll {
		return new MouseWheelRoll(deltaX, deltaY)
	}

	public async performAs({
		abilities: {
			browseTheWeb: { page }
		}
	}: User): Promise<void> {
		await page.mouse.wheel(this.deltaX, this.deltaY)
	}
}
