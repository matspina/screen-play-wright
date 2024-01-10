import { User } from '@actors/user'

export interface Activity<T> {
	performAs(user: User): Promise<T>
}
