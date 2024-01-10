import { getSessionSitesList } from '@config/demo-site/environments-map'

export class SamplePageTest {
	public static get URL(): string {
		const PATH = 'samplepagetest/'
		return getSessionSitesList().demoSite + PATH
	}

	public static readonly SELECTORS = {
		BUTTONS: {
			SUBMIT: 'button[type=submit]'
		},
		ELEMENTS: {
			INPUT_NAME: 'input.name',
			INPUT_EMAIL: 'input.email',
			COMBOBOX_EXPERIENCE: 'select#g2599-experienceinyears',
			CHECKBOX_AUTOMATION: 'input[value="Automation Testing"]',
			TEXT_AREA_COMMENTS: 'textarea#contact-form-comment-g2599-comment'
		}
	}
}
