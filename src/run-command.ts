import childProcess from 'child_process'
import { log, logError } from './log'

function stripColor(input: string): string {
	const pattern = [
		'[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
		'(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))',
	].join('|')

	const regex = new RegExp(pattern, 'g')

	return input.replace(regex, '')
}

export async function runCommand(text: string, command: string, filename: string, workspacePath: string): Promise<string> {
	const args = command.replace(/\$FILE/g, filename).split(' ')
	const file = args.shift()

	if (!file) return text

	const errorOut = (error: string) => {
		logError(`Received an error while formatting ${filename}:\n> ${command}\nError:\n> ${error.replace(/\n/g, '\n> ')}`)
	}

	const startMs = Date.now()
	log(`Formatting ${filename} with the following command:\n> ${command}`)

	try {
		const { stdout, stderr } = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
			let didReject = false

			const child = childProcess.exec(
				command,
				{ cwd: workspacePath, env: { ...process.env, FILE: filename }, shell: process.env.SHELL },
				(error, stdout, stderr) => {
					if (error) {
						if (!didReject) reject(error)

						didReject = true
						return
					}

					resolve({ stdout, stderr })
				}
			)

			if (child.stdin) {
				child.stdin.write(text, 'utf-8', err => {
					if (err && !didReject) {
						reject(err)
						didReject = true
						return
					}

					child.stdin!.end()
				})
			}
		})

		if (stderr.length) errorOut(stderr)

		if (stdout.length) {
			log(`Formatted ${filename} in ${Date.now() - startMs}ms`)
			return stdout
		}

		log(`Skipping ${filename}`)
		return text
	} catch (e) {
		errorOut(stripColor(`${e}`))
		return text
	}
}
