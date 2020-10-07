import { dirname } from 'path'
import { workspace, window, languages, ExtensionContext, TextDocument, TextEdit, Uri, commands, Range, Position } from 'vscode'

import { log } from './log'
import { runCommand } from './run-command'

interface Formatter {
	command: string
	language: string
}

export function activate(context: ExtensionContext) {
	log('Extension "custom-format" activated')

	createFormatters()

	workspace.onDidChangeConfiguration(e => {
		if (e.affectsConfiguration('custom-format.formatters')) {
			context.subscriptions.forEach(disposable => disposable.dispose())
			log(`Detected a change in the 'custom-format.formatters' configuration.  Reactivating formatters...`)
			createFormatters()
		}
	})

	function createFormatters() {
		const config = workspace.getConfiguration('custom-format')
		const formatters = config.get<Formatter[]>('formatters')

		if (!formatters) return

		let listeningLanguages: string[] = []

		for (let formatter of formatters) {
			if (!formatter.command || !formatter.language) {
				window
					.showErrorMessage(`Invalid formatter configuration in the \`custom-format.formatters\` setting.`, `Visit Docs`)
					.then(clicked => {
						log(clicked)
						commands.executeCommand('vscode.open', Uri.parse(`https://github.com/Vehmloewff/custom-format#configuration`))
					})
				break
			}

			let disposable = languages.registerDocumentFormattingEditProvider(formatter.language, {
				async provideDocumentFormattingEdits(document: TextDocument): Promise<TextEdit[]> {
					const rawText = document.getText()
					const filename = document.uri.path
					const workspaceDir = getCwd(filename)
					const formattedText = await runCommand(rawText, formatter.command, filename, workspaceDir)

					const lastLineNumber = document.lineCount - 1
					const lastLineChar = document.lineAt(lastLineNumber).text.length

					const startPos = new Position(0, 0)
					const endPos = new Position(lastLineNumber, lastLineChar)
					const replaceRange = new Range(startPos, endPos)

					return [TextEdit.replace(replaceRange, formattedText)]
				},
			})

			listeningLanguages.push(formatter.language)

			context.subscriptions.push(disposable)
		}

		log(`Formatting activated for the following languages: [${listeningLanguages.toLocaleString()}]`)
	}
}

function getCwd(filepath: string): string {
	const workspacePath = workspace.getWorkspaceFolder(Uri.parse(filepath))?.uri.path

	if (!workspacePath) {
		const dir = dirname(filepath)
		log(
			`File to format is not in a workspace.  Guessing that the format command's intended \`PWD\` is the dirname of the file (${dir}).`
		)
		return dir
	}

	return workspacePath
}

// this method is called when your extension is deactivated
export function deactivate() {}
