import { spawn } from 'child_process'

const isDocker = process.env.IS_DOCKER

if (isDocker) {
	console.log('WARN: Please run the report outside of the Docker container.')
	console.log('')
} else {
	const report = spawn('npx', ['playwright', 'show-report', 'playwright-report/report'], { shell: true })

	report.stdout.on('data', data => {
		console.log(`${data}`)
	})

	report.stderr.on('data', data => {
		console.error(`${data}`)
	})
}
