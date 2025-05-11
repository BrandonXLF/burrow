import { ipcRenderer } from 'electron';
import Tab from './Tab';
import SettingStore from '../utils/SettingStore';
import { Ace } from 'ace-builds';
import { getFileType } from '../utils/fileTypes';
import { popup } from './popups/popup';
import { extname } from 'path';
import ThemeMode from './ThemeMode';

export default class Tabs {
	tabs: Tab[] = [];
	currentTab: Tab;
	baseRowX: number;

	private tabIdCounter = 0;
	private tabMap: Record<string, WeakRef<Tab>> = {};
	
	constructor(
		public tabRow: HTMLElement,
		public webviewContainer: HTMLElement,
		public devtoolContainer: HTMLElement,
		public editor: Ace.Editor,
		public webContentsIdPromise: Promise<number>,
		public settings: SettingStore,
		public themeMode: ThemeMode
	) {
		this.baseRowX = tabRow.getBoundingClientRect().x;
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
		
		const newTab = this.tabs[index] ?? this.tabs[index - 1] ?? this.tabs[0];
		
		if (!newTab) {
			ipcRenderer.send('perform-window-action', 'close');
			return;
		}
		
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
	
	createFromFile(path: string, index?: number) {
		if (!getFileType(path)) {
			popup('Failed to open file', `Unsupported file type ${extname(path)}`);
			return;
		}

		this.createTab({ path }, index);
	}
	
	selectTab(tab: Tab): void {
		this.editor.setSession(tab.editorSession);

		document.querySelectorAll('.current').forEach(x => x.classList.remove('current'));
		
		this.currentTab = tab;
		this.updateNoPathAttribute();

		tab.tabElement.classList.add('current');
		tab.webviewSubContainer.classList.add('current');
		tab.devtools.classList.add('current');
		tab.switcher.el.classList.add('current');
	}

	updateNoPathAttribute() {
		if (this.currentTab.path) {
			document.body.removeAttribute(`data-no-path`);
			(document.getElementById('switch') as HTMLButtonElement).disabled = false;
		} else {
			document.body.setAttribute(`data-no-path`, '');
			(document.getElementById('switch') as HTMLButtonElement).disabled = true;
		}
	}
	
	selectPrev(): void {
		const index = this.getTabIndex(this.currentTab);

		this.selectTab(this.tabs[index - 1] ?? this.tabs[this.tabs.length - 1]);
	}
	
	selectNext(): void {
		const index = this.getTabIndex(this.currentTab);

		this.selectTab(this.tabs[index + 1] ?? this.tabs[0]);
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
