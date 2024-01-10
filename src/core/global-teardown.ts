import 'tsconfig-paths/register'
import colors from 'colors'

export default async (): Promise<void> => {
	console.log(colors.cyan('\nRunning Global Teardown'))

	// Do something here after all tests are done

	console.log(colors.cyan('\nGlobal Teardown finished successfully'))
}
