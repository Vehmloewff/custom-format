import execa = require('execa')
import stripColor = require('strip-color')
import { log, logError } from './log'

export async function runCommand(text: string, command: string, filename: string, workspacePath: string): Promise<string> {
	const args = command.replace(/\$FILE/g, filename).split(' ')
	const file = args.shift()

	if (!file) return text

	const errorOut = (error: any) =>
		logError(
			`Received an error while running the following format command on ${filename}:\n> ${command}\nError:\n> ${error.replace(
				/\n/g,
				'\n> '
			)}`
		)

	const startMs = Date.now()

	try {
		const { stdout, stderr } = await execa(file, args, { input: text, cwd: workspacePath })

		if (stderr.length) errorOut(stderr)

		if (stdout.length) {
			log(`Formatted ${filename} in ${Date.now() - startMs}ms using the following command:\n> ${command}`)
			return stdout
		}

		log(`Skipping ${filename}`)
		return text
	} catch (e) {
		errorOut(`${(e as any).shortMessage}\n${stripColor((e as any).stderr)}`)
		return text
	}
}
