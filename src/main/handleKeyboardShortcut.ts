import { BrowserWindow } from 'electron';

const CTRLORCMD = 1;
const ALT = 2;
const SHIFT = 4;

const shortcuts: [string, number, string, string?][] = [
	['D', CTRLORCMD, 'toggle-devtools'],
	['D', CTRLORCMD | SHIFT, 'rotate-devtools'],
	['E', CTRLORCMD, 'toggle-editor'],
	['E', CTRLORCMD | SHIFT, 'rotate-editor'],
	['F', CTRLORCMD, 'find', 'NONE'],
	['N', CTRLORCMD, 'new'],
	['O', CTRLORCMD, 'open'],
	['P', CTRLORCMD, 'print'],
	['R', CTRLORCMD, 'run'],
	['S', CTRLORCMD, 'save'],
	['S', CTRLORCMD | SHIFT, 'save-as'],
	['W', CTRLORCMD, 'close'],
	['=', CTRLORCMD, 'zoom', 'NONE'],
	['Tab', CTRLORCMD, 'prev-tab'],
	['Tab', CTRLORCMD | SHIFT, 'next-tab'],
	['ArrowLeft', ALT, 'back'],
	['ArrowRight', ALT, 'forward'],
	['Escape', 0, 'close-mini', 'NONE']
];

export default function handleKeyboardShortcut(
	_: Electron.IpcMainEvent,
	editor: boolean,
	key: string,
	ctrlOrCmd: boolean,
	alt: boolean,
	shift: boolean
) {
	const flag = Number(ctrlOrCmd) * CTRLORCMD + Number(alt) * ALT + Number(shift) * SHIFT;
	
	shortcuts.some(([shortcutKey, shortcutFlag, action, editorAction]) => {
		if (shortcutKey.toUpperCase() !== key.toUpperCase() || (shortcutFlag && shortcutFlag !== flag)) return;

		BrowserWindow.getFocusedWindow()?.webContents.send('menu-action', (editor && editorAction) ? editorAction : action);
		
		return true;
	});
}