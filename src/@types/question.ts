import { User } from '../screenplay/actors/user.js'

export interface Question<T> {
	askAs(user: User): Promise<T>
}
