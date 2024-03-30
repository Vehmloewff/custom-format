# Custom Format

Run custom CLI commands for formatting files in VSCode.

How many times have you not been able to find a VSCode formatter for your particular purpose when there was already a CLI to do the job?  And how much easier is it to throw together a CLI command to format your code that it is to build an extension to suit your needs?

Because you are reading this, those questions can be favorably answered.  Introducing _Custom Format_.  Just add your CLI commands to the `custom-format.formatters` [configuration](#configuration) and you're set.

![feature X](./images/formatting.gif)

## Configuration

Populate the `custom-format.formatters` setting.

```jsonc
// global settings.json or .vscode/settings.json
{
	// ...

	// Create our custom formatters
	"custom-format.formatters": [
		{
			// Whatever language id you need to format
			"language": "javascript",
			// The command that will be run to format files with the language id specified above
			"command": "node format.js $FILE" // $FILE is replaced with the path of the file to be formatted
		},
		{
			"language": "typescript",
			"command": "node format-ts.js"
		}
	],

	// (optional) Set it as the default formatter for the languages we have configured formatters for
	"[javascript]": {
		"editor.defaultFormatter": "Vehmloewff.custom-format"
	},
	"[typescript]": {
		"editor.defaultFormatter": "Vehmloewff.custom-format"
	}
}
```

### Running commands

All specified commands are expected to read in unformatted code on their `stdin` and print the formatted code to their `stdout`.

In all cases, if any text is printed to `stderr`, the error will be relayed to the "Custom Format" output panel.

If text is printed to `stdout`, error or no error, the file will be overwritten with the printed text.

If there is no content written to `stdout`, error or no error, the formatting of the file will be skipped.

If the command exits with a non-zero code, the formatting of the file will be skipped.

Commands are executed in a subshell, not spawned directly.

Commands are provided with the environment variable, `FILE`, which is the absolute path to the file that is being formatted.

Although it is possible to read from and write to `$FILE` directly, it is better to read from `stdin` and write to `stdout` because it mutates the editor state, not the filesystem state, which could differ.

## Release Notes

See the [changelog](/CHANGELOG.md).

## Issues

Please report all issues [here](https://github.com/Vehmloewff/custom-format/issues).

## License

[MIT](/LICENSE)
