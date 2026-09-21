import { clipboard, ClipboardItem, ContextMenuParams, Menu, MenuItemConstructorOptions, session, WebContents } from 'electron';

export async function showContextMenu(params: ContextMenuParams, main: WebContents, webview?: WebContents) {
	const template: MenuItemConstructorOptions[] = [],
		focused = webview ?? main,
		hasSelection = params.selectionText.length > 0;
	
	if (webview) {
		template.push(
			{
				label: 'Back',
				enabled: webview.navigationHistory.canGoBack(),
				accelerator: 'Alt+Left',
				click: () => webview.navigationHistory.goBack()
			},
			{
				label: 'Forward',
				enabled: webview.navigationHistory.canGoForward(),
				accelerator: 'Alt+Right',
				click: () => webview.navigationHistory.goForward()
			}
		);
	}
	
	template.push({
		label: 'Run',
		accelerator: 'CmdOrCtrl+R',
		click: () => main.send('menu-action', 'run')
	})
	
	if (webview) {
		template.push(
			{
				type: 'separator'
			},
			{
				label: 'Find...',
				accelerator: 'CmdOrCtrl+F',
				click: () => main.send('menu-action', 'find')
			},
			{
				label: 'Zoom...',
				accelerator: 'CmdOrCtrl+=',
				click: () => main.send('menu-action', 'zoom')
			},
			{
				label: 'Print...',
				accelerator: 'CmdOrCtrl+P',
				click: () => webview.print({ silent: false })
			}
		);
	} else {
		template.push({
			label: 'Format',
			click: () => void focused.executeJavaScript('formatEditor()')
		});
	}
	
	template.push({
		type: 'separator'
	});
	
	if (params.isEditable) {
		template.push(
			{
				label: 'Undo',
				accelerator: 'CmdOrCtrl+Z',
				click: () => focused.undo()
			},
			{
				label: 'Redo',
				accelerator: 'CmdOrCtrl+Shift+Z ',
				click: () => focused.redo()
			},
			{
				type: 'separator',
			}
		);
	}
	
	if (params.isEditable) {
		template.push({
			label: webview ? 'Cut' : 'Cut as text',
			accelerator: 'CmdOrCtrl+Z',
			visible: params.isEditable,
			enabled: hasSelection,
			click: () => focused.cut()
		});
	}

	if (params.isEditable || hasSelection) {
		template.push({
			label: webview ? 'Copy' : 'Copy as text',
			accelerator: 'CmdOrCtrl+C',
			enabled: hasSelection,
			click: () => focused.copy()
		});
	}

	if (params.isEditable) {
		template.push({
			label: webview ? 'Paste' : 'Paste text',
			accelerator: 'CmdOrCtrl+V',
			enabled: await clipboard.has('text/plain'),
			click: () => focused.paste()
		});
	}

	if (!webview) {
		if (params.isEditable) {
			template.push(
				{
					type: 'separator'
				},
				{
					label: 'Cut as HTML',
					enabled: hasSelection,
					click: () => void focused.executeJavaScript(`htmlClipboard.cut()`)
				}
			);
		}

		if (params.isEditable || hasSelection) {
			template.push({
				label: 'Copy as HTML',
				enabled: hasSelection,
				click: () => void focused.executeJavaScript(`htmlClipboard.copy()`)
			});
		}

		if (params.isEditable) {
			template.push(
				{
					label: 'Paste HTML',
					enabled: await clipboard.has('text/html'),
					click: () => void focused.executeJavaScript(`htmlClipboard.paste()`)
				},
				{
					type: 'separator'
				}
			);
		}
	}

	if (params.isEditable || hasSelection) {
			template.push(
			{
				label: 'Select All',
				accelerator: 'CmdOrCtrl+A',
				click: () => focused.selectAll()
			},
			{
				type: 'separator'
			}
		)
	}
	
	if (webview) {
		let mediaType;

		switch (params.mediaType) {
			case 'image':
			case 'canvas':
				mediaType = 'Image';
				break;
			case 'video':
				mediaType = 'Video';
				break;
		}
		
		if (params.linkURL.length > 0) {
			template.push(
				{
					label: 'Copy Link Address',
					visible: params.linkURL.length > 0,
					click: () => clipboard.write([new ClipboardItem({ 'text/plain': params.linkURL })])
				},
				{
					type: 'separator',
					visible: params.linkURL.length > 0,
				}
			);
		}
		
		if (mediaType) {
			template.push(
				{
					label: `Save ${mediaType}`,
					click: () => session.defaultSession.downloadURL(params.srcURL)
				},
				{
					label: `Copy ${mediaType}`,
					click: () => webview.copyImageAt(params.x, params.y)
				},
				{
					label: `Copy ${mediaType} Address`,
					click: () => clipboard.write([new ClipboardItem({ 'text/plain': params.srcURL })])
				},
				{
					type: 'separator'
				}
			);
		}
		
		template.push({
			label: 'Inspect Element',
			click: () => {
				webview.inspectElement(params.x, params.y);
				main.send('menu-action', 'devtools');
			}
		});
	}
	
	Menu.buildFromTemplate(template).popup({
		x: params.x,
		y: params.y
	});
}