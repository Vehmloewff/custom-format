import { window } from 'vscode'

let channel = window.createOutputChannel('Custom Format')

export function log(data: string | undefined | false | null) {
	channel.appendLine(`${data}`)
}

export function logError(data: string | undefined | false | null) {
	channel.appendLine(`[error] ${data}`)
}
