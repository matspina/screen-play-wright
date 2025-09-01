import { exec } from 'child_process'

const isWin = process.platform === 'win32'

// On Windows machines, we are setting up the default shell for NPM executions as powershell,
// because it has a better compatibility with the scripts we run in this project.
if (isWin) {
	exec('npm config set script-shell powershell --userconfig ./.npmrc', (error, _stdout, stderr) => {
		if (error) {
			console.log(error)
			process.exit(1)
		}
		if (stderr) {
			console.log(stderr)
			process.exit(1)
		}
	})
}
