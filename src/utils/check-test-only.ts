import { exec } from 'child_process'
import colors from 'colors'

const checkTestOnly = () => {
	const MESSAGES = {
		1: `\n${colors.bold.red('>>> ERROR:')} Some test file(s) contain(s) ${colors.bold.red('.only')} keyword:\n`,
		2: `${colors.yellow('Committing test files with .only usually is a mistake.')}`,
		3: `${colors.yellow('If you are sure you want to commit it, use the flag -n to skip pre-commit checks.\n')}`
	}

	// It gets test .spec files which contain test.only OR test.describe.only
	exec('git diff --staged -- *.spec.ts | grep -E "\\+\\s*test(\\.describe)?\\.only"', (empty, stdout, stderr) => {
		if (stderr) {
			console.error(`stderr: ${stderr}`)
			process.exit(1)
		}
		if (empty) return
		if (stdout) {
			console.log(MESSAGES[1])
			console.log(colors.grey(stdout.replace(/\+\s*/g, '> ').replace(/\.only/g, colors.bold.red('.only'))))
			console.log(MESSAGES[2])
			console.log(MESSAGES[3])
			process.exit(1)
		}
	})
}

checkTestOnly()
