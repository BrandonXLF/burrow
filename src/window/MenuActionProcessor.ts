import { ipcRenderer } from 'electron';
import showAbout from './popups/showAbout';
import openFile from './openFile';
import UserSettingsPopup from './popups/UserSettingsPopup';
import SettingStore from '../utils/SettingStore';
import SplitElement from './SplitElement';
import Tabs from './Tabs';

export default class MenuActionProcessor {
	constructor(
		private tabs: Tabs,
		private mainSplit: SplitElement,
		private viewerSplit: SplitElement,
		private settings: SettingStore
	) { }

	processRequest(_: Electron.IpcRendererEvent, action: string, mode?: string) {
		switch (action) {
			case 'print':
				this.tabs.currentTab.webview.print({ silent: false });
				break;
			case 'find':
				this.tabs.currentTab.miniPopupFactory.showFindPopup();
				break;
			case 'zoom':
				this.tabs.currentTab.miniPopupFactory.showZoomPopup();
				break;
			case 'terminate':
				ipcRenderer.send('crash-renderer', this.tabs.currentTab.webview.getWebContentsId());
				break;
			case 'format':
				window.formatEditor();
				break;
			case 'rotate-editor':
				this.settings.set('editorDirection', this.mainSplit.toggleDirection());
				break;
			case 'rotate-devtools':
				this.settings.set('devtoolsDirection', this.viewerSplit.toggleDirection());
				break;
			case 'save':
				this.tabs.currentTab.save();
				break;
			case 'save-as':
				this.tabs.currentTab.save(SaveType.SetName);
				break;
			case 'settings':
				new UserSettingsPopup(this.settings).show();
				break;
			case 'about':
				showAbout();
				break;
			case 'run':
				this.tabs.currentTab.preview();
				break;
			case 'devtools':
				this.viewerSplit.toggleVisible(true);
				break;
			case 'open':
				openFile(this.tabs);
				break;
			case 'toggle-devtools':
				this.viewerSplit.toggleVisible();
				break;
			case 'toggle-editor':
				this.mainSplit.toggleVisible();
				break;
			case 'close':
				this.tabs.currentTab.close();
				break;
			case 'new':
				this.tabs.createTab({ mode: mode ?? this.tabs.currentTab.mode });
				break;
			case 'prev-tab':
				this.tabs.selectPrev();
				break;
			case 'next-tab':
				this.tabs.selectNext();
				break;
			case 'back':
				this.tabs.currentTab.webview.goBack();
				break;
			case 'forward':
				this.tabs.currentTab.webview.goForward();
				break;
			case 'close-mini':
				this.tabs.currentTab.miniPopupFactory?.currentPopup?.dispose();
				break;
		}
	}
}