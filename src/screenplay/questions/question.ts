import { User } from '@actors/user'

export interface Question<T> {
	askAs(user: User): Promise<T>
}
