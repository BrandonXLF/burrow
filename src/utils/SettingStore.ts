import Store from 'electron-store';

export default class SettingStore {
	readonly defaults: Record<string, unknown> = {
		// User settings
		autoRun: true,
		autoSave: true,
		theme: 'system',
		viewerUseTheme: true,
		autoEdit: false,
		autoDevtools: false,
		autoSwitcher: false,
		softTabs: false,
		tabSize: 4,
		showInvisible: false,
		gutter: true,
		wordWrap: true,
		defaultType: 'html',
		autocomplete: true,
		enableSnippets: true,
		
		// Layout settings
		editorDirection: 'horizontal',
		devtoolsDirection: 'vertical',
		editorWidth: '50%',
		editorHeight: '50%',
		viewerWidth: '50%',
		viewerHeight: '50%',
		switcherWidth: '175px'
	};
	
	constructor(
		public onSet: () => void,
		public store = new Store()
	) { }
	
	get<T>(name: string) {
		return this.store.get(name, this.defaults[name]) as T;
	}
	
	set<T>(name: string, value: T): void {
		this.store.set(name, value);
		this.onSet();
	}

	listen<T>(name: string, callback: (newValue: T) => void): () => void {
		return this.store.onDidChange(name, callback);
	}

	callAndListen<T>(name: string, callback: (newValue: T) => void): () => void {
		callback(this.get(name));
		return this.store.onDidChange(name, callback);
	}

	markExternalSet() {
		this.store.events.dispatchEvent(new Event('change'));
	}
}