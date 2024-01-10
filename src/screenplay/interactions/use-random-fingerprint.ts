import { FingerprintGenerator } from 'fingerprint-generator'
import { FingerprintInjector } from 'fingerprint-injector'

import { Activity } from '@activity'
import { User } from '@actors/user'

/**
 * Injects a random browser fingerprint to the context, in order to avoid bot detection.
 * E.g.: UseRandomFingerprint.onBrowser()
 * @method `.onBrowser()` Static initializer. Injects a random browser fingerprint.
 */
export class UseRandomFingerprint implements Activity<void> {
	public static onBrowser(): UseRandomFingerprint {
		return new UseRandomFingerprint()
	}

	public async performAs({
		abilities: {
			browseTheWeb: { page }
		}
	}: User): Promise<void> {
		const fingerprintGenerator = new FingerprintGenerator()
		const fingerprintInjector = new FingerprintInjector()
		const fingerprint = fingerprintGenerator.getFingerprint()
		await fingerprintInjector.attachFingerprintToPlaywright(page.context(), fingerprint)
	}
}
