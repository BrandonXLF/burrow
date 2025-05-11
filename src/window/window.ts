import './less/window.less';

import ace from 'ace-builds';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-searchbox';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/mode-markdown';
import 'ace-builds/src-noconflict/mode-svg';
import 'ace-builds/src-noconflict/theme-clouds';
import 'ace-builds/src-noconflict/theme-clouds_midnight';
import 'ace-builds/src-noconflict/snippets/html';

import { ipcRenderer } from 'electron';
import Tabs from './Tabs';
import SettingStore from '../utils/SettingStore';
import SplitElement from './SplitElement';
import promptUnsaved from './popups/promptUnsaved';
import { getEditorOptions, initializeSettings } from './userOptions';
import Icon from '../icon/icon.ico';
import WebDialogFactory from './popups/WebDialogFactory';
import MenuActionProcessor from './MenuActionProcessor';
import UpdateUI from './UpdateUI';
import ThemeMode from './ThemeMode';
import HTMLClipboard from './HTMLClipboard';
import format from './format';

declare global {
	interface Window {
		htmlClipboard: HTMLClipboard;
		formatEditor: () => Promise<void>;
	}
}

const openFilePrefix = '--open-file=',
	openFiles = process.argv
		.filter(arg => arg.startsWith(openFilePrefix))
		.map(arg => arg.substring(openFilePrefix.length)),
	webContentsIdPromise = ipcRenderer.invoke('get-webcontents-id'),
	settings = new SettingStore(() => ipcRenderer.send('renderer-settings-updated')),
	themeMode = new ThemeMode(),
	editor = ace.edit(
		document.querySelector<HTMLElement>('#editor-container')!,
		getEditorOptions(settings, themeMode)
	),
	tabs = new Tabs(
		document.getElementById('tabs')!,
		document.getElementById('webview-container')!,
		document.getElementById('devtool-container')!,
		editor,
		webContentsIdPromise,
		settings,
		themeMode
	),
	mainSplit = new SplitElement(
		'editor',
		document.getElementById('main-container')!,
		settings.get('editorDirection'),
		openFiles.length == 0 || settings.get('autoEdit'),
		settings.get('editorWidth'),
		settings.get('editorHeight')
	),
	viewerSplit = new SplitElement(
		'devtools',
		document.getElementById('viewer-container')!,
		settings.get('devtoolsDirection'),
		settings.get('autoDevtools'),
		settings.get('viewerWidth'),
		settings.get('viewerHeight')
	),
	updateUI = new UpdateUI();

mainSplit.on('width', x => settings.set('editorWidth', x));
mainSplit.on('height', x => settings.set('editorHeight', x));
mainSplit.on('visible', () => editor.resize());

viewerSplit.on('width', x => settings.set('viewerWidth', x));
viewerSplit.on('height', x => settings.set('viewerHeight', x));

document.getElementById('edit')!.addEventListener('click', () => mainSplit.toggleVisible());
document.getElementById('inspect')!.addEventListener('click', () => viewerSplit.toggleVisible());
document.getElementById('run')!.addEventListener('click', () => tabs.currentTab.preview());
document.getElementById('header')!.addEventListener('contextmenu', e => e.preventDefault());

(document.getElementById('top-icon') as HTMLImageElement).src = Icon;

['options', 'new'].forEach(id => document.getElementById(id)!.addEventListener('click', () => {
	const rect = document.getElementById(id)!.getBoundingClientRect();

	ipcRenderer.send('show-menu', id, Math.round(rect.x), Math.round(rect.y + rect.height), tabs.currentTab.mode);
}));

['minimize', 'maximize', 'unmaximize', 'close'].forEach(windowAction => {
	document.getElementById(windowAction)!.addEventListener('click', () => ipcRenderer.send('perform-window-action', windowAction));
});

initializeSettings(settings, themeMode, editor, tabs);

if (openFiles.length) {
	for (const file of openFiles) {
		tabs.createFromFile(file);
	}
} else {
	tabs.createTab();
}

window.htmlClipboard = new HTMLClipboard(editor);
window.formatEditor = () => format(editor, tabs.currentTab.mode, settings);

let forceClose = false;
window.addEventListener('beforeunload', async e => {
	if (forceClose || !tabs.tabs.some(tab => tab.unsaved)) return;

	e.preventDefault();

	if (await promptUnsaved(tabs, settings)) {
		forceClose = true;
		ipcRenderer.send('perform-window-action', 'close');
	}
});

document.body.addEventListener('keyup', e => ipcRenderer.send(
	'keyboard-input',
	true,
	e.key,
	process.platform === 'darwin' ? e.metaKey : e.ctrlKey,
	e.altKey,
	e.shiftKey
));

ipcRenderer.on('settings-updated', () => settings.markExternalSet());

ipcRenderer.on('release-tab-to', (_, localTabId: string, targetId: number, targetIndex?: number) => {
	const tab = tabs.getTabById(localTabId);

	if (!tab) return;

	ipcRenderer.send('send-tab-to', targetId, tab.getTabData(), targetIndex);
	tabs.removeTab(tab);
});

ipcRenderer.on('open-files', (_, files: string[]) => files.forEach(file => tabs.createFromFile(file)));
ipcRenderer.on('show-tab', (_, tabData: TabData, index?: number) => tabs.createTab(tabData, index));

ipcRenderer.on('maximize', () => document.body.classList.add('maximized'));
ipcRenderer.on('unmaximize', () => document.body.classList.remove('maximized'));

const webDialogFactory = new WebDialogFactory(tabs),
	menuActionProcessor = new MenuActionProcessor(tabs, mainSplit, viewerSplit, settings);

ipcRenderer.on('web-dialog-request', webDialogFactory.processRequest.bind(webDialogFactory));
ipcRenderer.on('menu-action', menuActionProcessor.processRequest.bind(menuActionProcessor));

updateUI.init();

ipcRenderer.send('ipc-message');