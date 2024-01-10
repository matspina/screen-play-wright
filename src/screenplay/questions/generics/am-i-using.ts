import { expect } from '@playwright/test'

import { User } from '@actors/user'

import { Question } from '@questions/question'

type DeviceType = 'mobile' | 'desktop'

/**
 * Assert whether the page width is matching a mobile or desktop device.
 * E.g.: AmIUsing.aDesktopResolution()
 * E.g.: AmIUsing.aMobileResolution()
 * @method `.aDesktopResolution()` Static initializer. Asserts the page is at desktop resolution.
 * @method `.aMobileResolution()` Static initializer. Asserts the page is at mobile resolution.
 */
export class AmIUsing implements Question<void> {
	private deviceType: DeviceType

	private widthBreakpoint = 992

	constructor(deviceType: DeviceType) {
		this.deviceType = deviceType
	}

	public static aDesktopResolution(): AmIUsing {
		return new AmIUsing('desktop')
	}

	public static aMobileResolution(): AmIUsing {
		return new AmIUsing('mobile')
	}

	public async askAs({
		abilities: {
			browseTheWeb: { page }
		}
	}: User): Promise<void> {
		const { width } = page.viewportSize()
		if (this.deviceType === 'desktop')
			expect(
				width,
				`Expected to be at desktop resolution, but current page width is ${width}px`
			).toBeGreaterThanOrEqual(this.widthBreakpoint)
		if (this.deviceType === 'mobile')
			expect(width, `Expected to be at mobile resolution, but current page width is ${width}px`).toBeLessThan(
				this.widthBreakpoint
			)
	}
}
