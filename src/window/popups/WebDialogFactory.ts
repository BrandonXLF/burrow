import { ipcRenderer } from 'electron';
import Tabs from '../Tabs';
import { popup, PopupButton } from './popup';
import '../less/webDialog.less'

export default class WebDialogFactory {
	constructor(private tabs: Tabs) { }

	sendResponse(uuid: string, data: unknown) {
		ipcRenderer.send('web-dialog-response', uuid, data);
	}

	showDialog(
		uuid: string,
		title: string,
		msg: string | Node | (string | Node)[],
		showCancel: boolean,
		submitResponse: unknown | (() => unknown),
		cancelResponse: unknown | (() => unknown)
	) {
		const sendResponse = (response: unknown | (() => unknown)) => this.sendResponse(uuid, (response instanceof Function) ? response() : response);

		const buttons: PopupButton[] = [
			{
				text: 'OK',
				click: () => sendResponse(submitResponse),
			}
		];

		if (showCancel) {
			buttons.push({ text: 'Cancel' });
		}

		return popup(
			title,
			msg,
			buttons,
			this.tabs.currentTab.webviewSubContainer,
			false,
			() => sendResponse(cancelResponse),
			() => sendResponse(submitResponse)
		);
	}

	showAlert(uuid: string, message: unknown = '') {
		this.showDialog(
			uuid,
			'Alert',
			String(message),
			false,
			undefined,
			undefined
		);
	}

	showConfirm(uuid: string, message: unknown = '') {
		this.showDialog(
			uuid,
			'Confirm',
			String(message),
			true,
			true,
			false
		);
	}

	showPrompt(uuid: string, message: unknown = '', initial: unknown = '') {
		const input = document.createElement('input');
		input.value = String(initial);
		input.className = 'prompt-input';

		this.showDialog(
			uuid,
			'Prompt',
			[String(message), input],
			true,
			() => input.value,
			null
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