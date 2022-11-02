import { ipcRenderer } from 'electron';
import Tab from './Tab';
import { TabData } from '../types';
import SettingStore from './SettingStore';
import ace from 'brace';

export default class Tabs {
	tabs: Tab[] = [];
	tabRow: HTMLElement;
	webviewContainer: HTMLElement;
	devtoolContainer: HTMLElement;
	editor: ace.Editor;
	settings: SettingStore;
	currentTab: Tab;

	private tabIdCounter = 0;
	private tabMap: Record<string, WeakRef<Tab>> = {};
	private webContentsIdPromise: Promise<number>;
	
	constructor(
		tabRow: HTMLElement,
		webviewContainer: HTMLElement,
		devtoolContainer: HTMLElement,
		editor: ace.Editor,
		webContentsIdPromise: Promise<number>,
		settings: SettingStore
	) {
		this.tabRow = tabRow;
		this.webviewContainer = webviewContainer;
		this.devtoolContainer = devtoolContainer;
		this.editor = editor;
		this.webContentsIdPromise = webContentsIdPromise;
		this.settings = settings;
	}

	addTab(tab: Tab, index?: number): void {
		if (index === undefined) index = this.tabs.length;
		
		this.tabs.splice(index, 0, tab);
		
		const nextElement = this.tabRow.children[index];
		
		if (nextElement) {
			nextElement.before(tab.tabElement);
		} else {
			this.tabRow.append(tab.tabElement);
		}
		
		this.tabMap[tab.tabId] = new WeakRef(tab);
		
		this.selectTab(tab);
		
		if (this.tabs[index - 1] && !this.tabs[index - 1].path && !this.tabs[index - 1].editorSession.getValue()) {
			this.removeTab(this.tabs[index - 1]);
		}
	}
	
	removeTab(tab: Tab): void {
		const index = this.getTabIndex(tab);
		
		this.tabs.splice(index, 1);
		tab.dispose();
		
		const newTab = this.tabs[index] || this.tabs[index - 1] || this.tabs[0];
		
		if (!newTab) ipcRenderer.send('perform-window-action', 'close');
		
		this.selectTab(newTab);
	}
	
	moveTab(tab: Tab, newIndex?: number): void {
		if (newIndex === undefined) newIndex = this.tabs.length;
		
		const index = this.getTabIndex(tab);
		
		this.tabs.splice(index, 1);
		this.tabs.splice(newIndex, 0, tab);
		
		const nextElement = this.tabRow.children[newIndex];
		
		if (nextElement) {
			nextElement.before(tab.tabElement);
		} else {
			this.tabRow.append(tab.tabElement);
		}
	}
	
	async createTab(data?: TabData, index?: number): Promise<void> {
		this.addTab(new Tab(this, await this.getNewTabId(), data), index);
	}
	
	selectTab(tab: Tab): void {
		this.editor.setSession(tab.editorSession);
		
		document.querySelector('.tab.current')?.classList.remove('current');
		[...this.webviewContainer.children, ...this.devtoolContainer.children].forEach((x: HTMLElement) => x.style.display = 'none');
		
		this.currentTab = tab;
		
		tab.webview.style.display = '';
		tab.devtools.style.display = '';

		tab.tabElement.classList.add('current');
	}
	
	addToMainArea(...elements: HTMLElement[]): void {
		this.webviewContainer.append(...elements);
	}
	
	addToDevtoolsArea(...elements: HTMLElement[]): void {
		this.devtoolContainer.append(...elements);
	}
	
	async getNewTabId(): Promise<string> {
		return `${await this.webContentsIdPromise}-${this.tabIdCounter++}`;
	}
	
	getTabById(id: string): Tab|undefined {
		return this.tabMap[id]?.deref();
	}
	
	getTabIndex(tab: Tab): number {
		return this.tabs.indexOf(tab);
	}
}