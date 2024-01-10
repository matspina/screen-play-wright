import { exec } from 'child_process'

const isWin = process.platform === 'win32'

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
