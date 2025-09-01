/* eslint-disable @typescript-eslint/no-explicit-any */
import Mailjs from '@cemalgnlts/mailjs'

import { Interaction } from '../../@types/interaction.js'
import { Question } from '../../@types/question.js'
import { BrowseTheWeb } from '../abilities/browse-the-web.js'

type Abilities = {
	browseTheWeb: BrowseTheWeb
}

export class User {
	public firstName: string

	public lastName: string

	public abilities: Abilities

	public username: string

	public password: string

	public mailjs: Mailjs

	public readonly emailInbox = []

	public readonly customProperties: Record<any, any> = {}

	constructor(firstName: string, lastName?: string) {
		this.firstName = firstName
		this.lastName = lastName
		this.abilities = {
			browseTheWeb: undefined
		}
	}

	public static named(firstName: string, lastName?: string): User {
		return new User(firstName, lastName)
	}

	public withUsername(username: string): User {
		this.username = username
		return this
	}

	public withPassword(password: string): User {
		this.password = password
		return this
	}

	public async usingMailjs(): Promise<User> {
		const mailjs = new Mailjs()
		let newMailAccount: Record<string, any>

		const MAX_ATTEMPTS = 5
		for (let i = 1; i <= MAX_ATTEMPTS; i++) {
			newMailAccount = await mailjs.createOneAccount()
			if (newMailAccount.status === true) break
			if (i === MAX_ATTEMPTS) throw Error('Not able to create temp email account')
			await new Promise(resolve => {
				setTimeout(resolve, 2000)
			})
		}

		mailjs.on('arrive', async message => {
			const messageResult = await mailjs.getMessage(message.id)
			this.emailInbox.push(messageResult)
		})

		this.mailjs = mailjs
		this.customProperties.mailjsUsername = newMailAccount.data.username
		this.customProperties.mailjsPassword = newMailAccount.data.password
		if (!this.username) this.username = this.customProperties.mailjsUsername
		if (!this.password) this.password = this.customProperties.mailjsPassword
		return this
	}

	public can(ability: BrowseTheWeb): void {
		this.abilities.browseTheWeb = ability
	}

	public async attemptsTo<T>(activity: Interaction<T>): Promise<T> {
		return activity.performAs(this)
	}

	public async asks<T>(question: Question<T>): Promise<T> {
		return question.askAs(this)
	}

	/**
	 * Does not break the test.
	 * Instead, returns true or false.
	 */
	public async kindlyAsks<T>(question: Question<T>): Promise<boolean> {
		try {
			await question.askAs(this)
			return true
		} catch (_e) {
			return false
		}
	}
}
