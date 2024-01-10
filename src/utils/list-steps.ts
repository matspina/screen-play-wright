import colors from 'colors'
import { readdir, readFile } from 'fs/promises'

const listSteps = async (): Promise<void> => {
	const target = process.argv[2]?.toUpperCase()
	const filter = process.argv[3]?.toUpperCase()

	let folder: string
	let finalMessage: string

	switch (target) {
		case 'INTERACTIONS':
			folder = './src/screenplay/interactions/'
			break
		case 'QUESTIONS':
			folder = './src/screenplay/questions/generics/'
			finalMessage =
				'\nTo check experiences custom questions, open (Ctrl + CLICK): ' +
				`${colors.cyan.underline('./src/screenplay/questions/custom/')}\n`
			break
		default:
			console.log('Invalid target provided.\n')
			return
	}

	const files = await readdir(folder)

	if (filter) {
		console.log(colors.bold(`Listing ${colors.cyan(target)} containing ${colors.cyan(filter)}:\n`))
	} else {
		console.log(colors.bold(`Listing ${colors.cyan(target)}:\n`))
	}

	for (const file of files) {
		const stepDetailRegex = /\/\*\*\n(.*)\n \*\//s
		const classNameRegex = /export class (\S+)/

		const fileContent = await readFile(`${folder}${file}`, { encoding: 'utf8' })
		const className = classNameRegex.exec(fileContent)?.[1]
		const stepDetails = stepDetailRegex.test(fileContent)
			? stepDetailRegex.exec(fileContent)[1]
			: ' * <File with no description>'

		const printDetails = (): void => {
			if (className) {
				console.log(colors.bold('--- --- --- --- --- --- --- --- ---'))
				console.log('')
				console.log(colors.bold(`Class name : ${colors.green(className)}`))
				console.log(colors.bold(`Source     : ${folder}${file}`))
				console.log('')
				console.log(stepDetails)
				console.log('')
			}
		}

		if (filter) {
			if (stepDetails.toUpperCase().includes(filter)) printDetails()
		} else {
			printDetails()
		}
	}

	if (finalMessage) console.log(`=== === === === === === === === ===\n${finalMessage}`)
}

listSteps()
