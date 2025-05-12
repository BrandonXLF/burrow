import * as fs from 'fs/promises';
import { join, dirname } from 'path';
import { getFileType } from '../utils/fileTypes';
import Tab from './Tab';
import './less/switcher.less';

export default class FileSwitcher {
	el = document.createElement('div');
	controller?: AbortController;
	folder: string;
	observer = new IntersectionObserver(entries => {
		const intersecting = entries.some(entry => entry.isIntersecting);

		if (!intersecting && this.controller) {
			this.controller?.abort();
			this.controller = undefined;
		} else if (intersecting && !this.controller) {
			this.watchFolder();
		}
	});

	constructor(public readonly tab: Tab) {
		this.el.classList.add('show-when-current');
		this.el.role = 'tree';

		this.observer.observe(this.el);
	}

	async watchFolder(): Promise<void> {
		if (!this.folder) return;

		this.controller?.abort();
		this.controller = new AbortController();

		const watcher = fs.watch(this.folder, {
			signal: this.controller.signal,
			recursive: true
		});

		this.populateSwitcher();

		try {
			for await (const _ of watcher) {
				this.populateSwitcher();
			}
		} catch (err) {
			if (err.name !== 'AbortError') throw err;
		}
	}

	private async createSwitcherTree(dirPath: string, expandChildren: boolean): Promise<HTMLElement> {
		const items = await fs.readdir(dirPath, { withFileTypes: true });
		const group = document.createElement('div');
		group.role = 'group';
		group.className = 'switcher-group';

		if (expandChildren) {
			const el = document.createElement('div');
			el.role = 'treeitem';
			el.className = 'switcher-item switcher-name';
			el.innerText = '..';
			el.ariaSelected = 'false';

			el.addEventListener('click', () => {
				this.folder = dirname(dirPath);
				this.populateSwitcher();
			});

			group.append(el);
		}

		for (const item of items) {
			const path = join(item.parentPath, item.name);

			if (item.isFile()) {
				const fileType = getFileType(join(item.parentPath, item.name));
				if (!fileType) continue;

				const el = document.createElement('div');
				el.role = 'treeitem';
				el.className = 'switcher-item switcher-name';
				el.innerText = item.name;
				el.ariaSelected = (this.tab.path === path).toString();

				el.addEventListener('click', () => {
					this.tab.setPath(path, true, true);
					this.populateSwitcher();
				});

				group.append(el);
				continue;
			}

			if (!expandChildren) continue;

			if (item.isDirectory()) {
				const cnt = document.createElement('div');
				cnt.role = 'treeitem';
				cnt.className = 'switcher-item';
				cnt.ariaExpanded = expandChildren ? 'true' : 'false';
				
				const el = document.createElement('div');
				el.className = 'switcher-name';
				el.innerText = item.name;

				el.addEventListener('click', () => {
					this.folder = path;
					this.populateSwitcher();
				});
				
				cnt.append(el, await this.createSwitcherTree(path, false));
				group.append(cnt);
			}
		}

		return group;
	}

	async populateSwitcher() {
		if (!this.folder) return;

		this.el.replaceChildren(
			await this.createSwitcherTree(this.folder, true)
		);
	}

	dispose(): void {
		this.controller?.abort();
		this.observer.disconnect();
		this.el.remove();
	}
}