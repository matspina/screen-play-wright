import { Frame, Page, Request } from '@playwright/test'
import colors from 'colors'

export interface PageWithGUID extends Page {
	_guid: string
}

export class BrowseTheWeb {
	public page: PageWithGUID

	public readonly abilityName: string

	constructor(page: Page) {
		this.page = page as PageWithGUID
		this.abilityName = 'browseTheWeb'
	}

	public getActiveRequestsMap(): Array<string> {
		return [...this.activeRequestsMap[this.page._guid]]
	}

	public getRequestsHistory(): Array<Request> {
		return [...this.requestsHistory[this.page._guid]]
	}

	private activeRequestsMap: Record<PageWithGUID['_guid'], Array<string>> = {}

	private requestsHistory: Record<PageWithGUID['_guid'], Array<Request>> = {}

	private initNetworkObserver() {
		const DEBUG = process.env.npm_config_debug
		const DELAY = 750
		const requestDoneTimeouts = []

		// Below are some URL patterns that should be ignored (usually analytics) that can mess up the network.
		const GLOBAL_PATTERNS_IGNORED = [
			/^https?:\/\/([-\w.]*\.)?google-analytics.com\/g\/collect/,
			/^https?:\/\/([-\w.]*\.)?tr\.snapchat\.com/
		]

		const shouldIgnore = (url: string) => {
			return GLOBAL_PATTERNS_IGNORED.some(pattern => {
				return pattern.test(url)
			})
		}

		const increaseActiveRequestsList = (request: Request) => {
			if (shouldIgnore(request.url())) return
			const page = request.frame().page() as PageWithGUID
			this.activeRequestsMap[page._guid].push(request.url())
			if (DEBUG) console.log(`${colors.cyan('>>>')} [${this.activeRequestsMap[page._guid].length}]: ${request.url()}`)
		}

		const decreaseActiveRequestsList = (request: Request) => {
			if (shouldIgnore(request.url())) return
			const page = request.frame().page() as PageWithGUID
			requestDoneTimeouts.push(
				setTimeout(() => {
					const requestIndex = this.activeRequestsMap[page._guid].indexOf(request.url())
					if (requestIndex >= 0) {
						this.activeRequestsMap[page._guid].splice(requestIndex, 1)
						if (DEBUG)
							console.log(`${colors.green('<<<')} [${this.activeRequestsMap[page._guid].length}]: ${request.url()}`)
					}
				}, DELAY)
			)
		}

		const onRequest = (request: Request) => {
			const page = request.frame().page() as PageWithGUID
			this.requestsHistory[page._guid].push(request)
			increaseActiveRequestsList(request)
		}
		const onRequestDone = (request: Request) => {
			decreaseActiveRequestsList(request)
		}

		const resetFrameActiveRequests = (frame: Frame) => {
			if (frame.url() === frame.page().mainFrame().url()) {
				const frameNavigation = `FRAME NAVIGATION: ${frame.url().split('#')[0]}`
				requestDoneTimeouts.forEach(clearTimeout)
				const page = frame.page() as PageWithGUID
				this.activeRequestsMap[page._guid] = [frameNavigation]
				if (DEBUG) console.log(`${colors.cyan('>>>')} ${frameNavigation}`)
				requestDoneTimeouts.push(
					setTimeout(() => {
						const requestIndex = this.activeRequestsMap[page._guid].indexOf(frameNavigation)
						this.activeRequestsMap[page._guid].splice(requestIndex, 1)
						if (DEBUG)
							console.log(`${colors.green('<<<')} [${this.activeRequestsMap[page._guid].length}]: ${frameNavigation}`)
					}, DELAY)
				)
			}
		}

		const context = this.page.context()

		for (const page of context.pages() as PageWithGUID[]) {
			this.activeRequestsMap[page._guid] = []
			this.requestsHistory[page._guid] = []
			page.on('request', onRequest)
			page.on('requestfinished', onRequestDone)
			page.on('requestfailed', onRequestDone)
			page.on('framenavigated', resetFrameActiveRequests)
		}
		context.on('page', (page: PageWithGUID) => {
			this.activeRequestsMap[page._guid] = []
			this.requestsHistory[page._guid] = []
			page.on('request', onRequest)
			page.on('requestfinished', onRequestDone)
			page.on('requestfailed', onRequestDone)
			page.on('framenavigated', resetFrameActiveRequests)
		})
		context.on('close', () => requestDoneTimeouts.forEach(clearTimeout))
	}

	private emulateSlowNetwork() {
		this.page
			.context()
			.newCDPSession(this.page)
			.then(session => {
				session.send('Network.emulateNetworkConditions', {
					offline: false,
					downloadThroughput: (5000 * 1024) / 8,
					uploadThroughput: (800 * 1024) / 8,
					latency: 100
				})
			})
	}

	public static with(page: Page): BrowseTheWeb {
		const browseTheWeb = new BrowseTheWeb(page)
		if (process.env.npm_config_slow_network) browseTheWeb.emulateSlowNetwork()
		browseTheWeb.initNetworkObserver()
		return browseTheWeb
	}
}
