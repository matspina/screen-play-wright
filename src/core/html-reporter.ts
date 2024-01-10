/* eslint-disable import/no-relative-packages */
import colors from 'colors'

import HtmlReporter from '../../node_modules/@playwright/test/lib/reporters/html.js'

class CustomHtmlReporter extends HtmlReporter {
	async onEnd(): Promise<void> {
		await super.onEnd()
		if (process.env.IS_DOCKER && !process.env.CI) {
			console.log()
			console.log(`${colors.bold('Attention:')} use another terminal outside the DOCKER container to open this report.`)
		}
	}
}

export default CustomHtmlReporter
