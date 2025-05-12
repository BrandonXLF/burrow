import Tab from '../Tab';
import { useSVG } from '../useSVG';
import { popup } from './popup';

export default class MiniPopupFactory {
	static ZOOM_LEVELS = [0.25, 1/3, 0.5, 2/3, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5];

	currentPopup: {
		type: string;
		dispose: () => unknown;
	} | undefined;
	
	constructor(private tab: Tab) { }

	showZoomPopup() {
		if (this.currentPopup) {
			if (this.currentPopup.type === 'zoom') return;
			this.currentPopup.dispose();
		}

		const zoomText = new Text('100%'),
			showZoom = (zoom: number) => zoomText.data = Math.round(zoom * 100) + '%';
		
		const initialZoom = this.tab.webview.getZoomFactor();
		
		let zoomIndex = 0;
		
		while (MiniPopupFactory.ZOOM_LEVELS[zoomIndex] < initialZoom) zoomIndex++;
		
		showZoom(initialZoom);

		const closePopup = popup(
			'',
			zoomText,
			[
				{
					text: useSVG('minus'),
					click: () => {
						zoomIndex = Math.max(zoomIndex - 1, 0);
						this.tab.webview.setZoomFactor(MiniPopupFactory.ZOOM_LEVELS[zoomIndex]);
						showZoom(MiniPopupFactory.ZOOM_LEVELS[zoomIndex]);
					},
					keepOpen: true
				},
				{
					text: useSVG('plus'), click: () => {
						zoomIndex = Math.min(zoomIndex + 1, MiniPopupFactory.ZOOM_LEVELS.length - 1);
						this.tab.webview.setZoomFactor(MiniPopupFactory.ZOOM_LEVELS[zoomIndex]);
						showZoom(MiniPopupFactory.ZOOM_LEVELS[zoomIndex]);
					},
					keepOpen: true
				},
				{
					text: 'Reset', click: () => {
						zoomIndex = MiniPopupFactory.ZOOM_LEVELS.indexOf(1);
						this.tab.webview.setZoomFactor(MiniPopupFactory.ZOOM_LEVELS[zoomIndex]);
						showZoom(MiniPopupFactory.ZOOM_LEVELS[zoomIndex]);
					},
					keepOpen: true
				},
				{
					text: useSVG('x'),
					click: () => this.currentPopup!.dispose()
				},
			],
			this.tab.webviewSubContainer,
			true
		);
		
		this.currentPopup = {
			type: 'zoom',
			dispose: () => {
				closePopup();
				this.currentPopup = undefined;
			}
		};
	}

	showFindPopup() {
		if (this.currentPopup) {
			if (this.currentPopup.type === 'find') return;
			this.currentPopup.dispose();
		}

		const input = document.createElement('input'),
			current = new Text('0'),
			sep = new Text('/'),
			total = new Text('0'),
			onFoundInPage = (e: Electron.FoundInPageEvent) => {
				current.data = e.result.activeMatchOrdinal.toString();
				total.data = e.result.matches.toString();
			};
			
		this.tab.webview.addEventListener('found-in-page', onFoundInPage);

		input.style.marginRight = '4px';

		input.addEventListener('input', () => {
			this.tab.webview.stopFindInPage('clearSelection');

			this.tab.webview.findInPage(input.value, {
				findNext: true
			});
		});

		const closePopup = popup(
			'',
			[input, current, sep, total],
			[
				{
					text: useSVG('prev'),
					click: () => {
						this.tab.webview.findInPage(input.value, {
							forward: false,
							findNext: false
						});
					},
					keepOpen: true
				},
				{
					text: useSVG('next'),
					click: () => {
						this.tab.webview.findInPage(input.value, {
							forward: true,
							findNext: false
						})
					},
					keepOpen: true
				},
				{
					text: useSVG('x'),
					click: () => this.currentPopup!.dispose()
				},
			],
			this.tab.webviewSubContainer,
			true
		);

		input.focus();

		this.currentPopup = {
			type: 'find',
			dispose: () => {
				closePopup();
				this.tab.webview.stopFindInPage('clearSelection');
				this.tab.webview.removeEventListener('found-in-page', onFoundInPage);
				this.currentPopup = undefined;
			}
		};
	}
}