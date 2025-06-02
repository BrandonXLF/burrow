import { IpcRendererEvent, ipcRenderer } from 'electron';
import { popup } from './popup';

export default function updateStatusPopup(init: true): void;
export default function updateStatusPopup(init: false, status: UpdateStatus): void;
export default function updateStatusPopup(init: boolean, status?: UpdateStatus): void {
    if (init) ipcRenderer.send('check-for-updates');

    const title = new Text(init ? 'Initializing...' : status!.title),
        details = new Text(init ? 'Updater initializing...' : status!.details);

    const updateStateListener = (_: IpcRendererEvent, status: UpdateStatus) => {
        title.textContent = status.title;
        details.textContent = status.details;
    };

    popup(
        title,
        details,
        [{ text: init ? 'Close' : 'OK' }],
        undefined,
        false,
        () => ipcRenderer.off('update-status', updateStateListener)
    );

    ipcRenderer.on('update-status', updateStateListener);
}