import { fileTypes } from "../../utils/fileTypes";

export const userSettingsData = [
	{
		name: 'Behaviour',
		settings: [
			{
				type: 'checkbox',
				name: 'autoRun',
				label: 'Automatic preview'
			},
			{
				type: 'checkbox',
				name: 'autoSave',
				label: 'Autosave'
			},
			{
				type: 'checkbox',
				name: 'autoEdit',
				label: 'Show editor on launch with file'
			},
			{
				type: 'checkbox',
				name: 'autoDevtools',
				label: 'Show devtools on launch'
			},
			{
				type: 'checkbox',
				name: 'autoSwitcher',
				label: 'Show file switcher by default'
			},
			{
				type: 'select',
				name: 'defaultType',
				label: 'Default file type',
				values: fileTypes.map(typeInfo => ({
					value: typeInfo.type,
					label: typeInfo.name
				}))
			}
		]
	},
	{
		name: 'Appearance',
		settings: [
			{
				type: 'select',
				name: 'theme',
				label: 'Theme',
				values: [
					{
						value: 'dark',
						label: 'Dark'
					},
					{
						value: 'light',
						label: 'Light'
					},
					{
						value: 'system',
						label: 'System'
					}
				]
			},
			{
				type: 'checkbox',
				name: 'viewerUseTheme',
				label: 'Apply theme to viewer'
			}
		]
	},
	{
		name: 'Editor',
		settings: [
			{
				type: 'checkbox',
				name: 'softTabs',
				label: 'Use spaces as tabs'
			},
			{
				type: 'number',
				name: 'tabSize',
				label: 'Tab length'
			},
			{
				type: 'checkbox',
				name: 'showInvisible',
				label: 'Show invisible characters'
			},
			{
				type: 'checkbox',
				name: 'gutter',
				label: 'Show line numbers'
			},
			{
				type: 'checkbox',
				name: 'wordWrap',
				label: 'Wrap long lines'
			},
			{
				type: 'checkbox',
				name: 'autocomplete',
				label: 'Autocompletion'
			},
			{
				type: 'checkbox',
				name: 'enableSnippets',
				label: 'Enable code snippets'
			}
		]
	}
];