import { ipcRenderer } from 'electron';
import Tabs from '../Tabs';
import { popup } from './popup';

export default class WebDialogFactory {
	constructor(private tabs: Tabs) { }

	sendResponse(uuid: string, data: unknown) {
		ipcRenderer.send('web-dialog-response', uuid, data);
	}

	showAlert(uuid: string, message: unknown = '') {
		popup(
			'Alert',
			String(message),
			[
				{
					text: 'OK',
					click: () => this.sendResponse(uuid, undefined)
				}
			],
			this.tabs.currentTab.webviewSubContainer
		);
	}

	showConfirm(uuid: string, message: unknown = '') {
		popup(
			'Confirm',
			String(message),
			[
				{
					text: 'OK',
					click: () => this.sendResponse(uuid, true)
				},
				{
					text: 'Cancel',
					click: () => this.sendResponse(uuid, false)
				}
			],
			this.tabs.currentTab.webviewSubContainer
		);
	}

	showPrompt(uuid: string, message: unknown = '', initial: unknown = '') {
		const input = document.createElement('input');
		input.value = String(initial);
		input.className = 'prompt-input';

		popup(
			'Prompt',
			[String(message), input],
			[
				{
					text: 'OK',
					click: () => this.sendResponse(uuid, input.value)
				},
				{
					text: 'Cancel',
					click: () => this.sendResponse(uuid, null)
				}
			],
			this.tabs.currentTab.webviewSubContainer
		);
	}

	processRequest(_: Electron.IpcRendererEvent, uuid: string, type: string, message: unknown, initial: unknown)  {
		switch (type) {
			case 'alert':
				this.showAlert(uuid, message);
				break;
			case 'confirm':
				this.showConfirm(uuid, message);
				break;
			case 'prompt':
				this.showPrompt(uuid, message, initial);
		}
	}
}