export interface GenericIdentityFn {
	(): Promise<unknown> | unknown
}

export interface RetryOptions {
	expectTimeout?: number
	retryInterval?: number
}

export interface GlobalSetupAndTeardownOptions {
	enableLogs: boolean
}
