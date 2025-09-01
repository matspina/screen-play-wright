import { User } from '../screenplay/actors/user.js'

export interface Interaction<T> {
	performAs(user: User): Promise<T>
}
