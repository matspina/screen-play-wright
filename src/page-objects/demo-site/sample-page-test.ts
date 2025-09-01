import { getSessionSitesList } from '@config/environments-map'

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
			TEXT_AREA_COMMENTS: 'textarea[name*=comment]',
			CONTACT_FORM_SUCCERSS_HEADER: '#contact-form-success-header',
			FORM_ERROR_WRAPPER: '.form-errors',
			PAGE_HEADER_CONTAINER: '.full_container_page_title > div > div'
		}
	}
}
