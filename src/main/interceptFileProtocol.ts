import { session } from 'electron';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import convertText from './convertText';
import { getFileType } from '../utils/fileTypes';

export default function interceptFileProtocol(_: Electron.IpcMainEvent, partition: string, file: string, mode: string, text: string) {
	const ses = session.fromPartition(partition);

	// Second request could have been cancelled
	if (ses.protocol.isProtocolHandled('file')) 
		ses.protocol.unhandle('file');

	ses.webRequest.onBeforeRequest((req, callback) => {
		if (
			ses.protocol.isProtocolHandled('file') || // Intercept already added
			!req.url.startsWith('file:') // Not a file: url
		) return callback({});
		
		let requestFile: string | undefined;
		
		try {
			requestFile = fileURLToPath(req.url);
		} catch (_) {
			// Not a valid file
		}
		
		let intercept: (() => string | Promise<string>) | undefined;
		
		// Intercept the file being edited
		if (req.url === `file://${partition}/` || (requestFile !== undefined && requestFile === file)) {
			intercept = () => convertText(mode, text);
		// Convert supported file types
		} else if (requestFile !== undefined && getFileType(requestFile)) {
			intercept = async () => convertText(mode, await fs.readFile(requestFile!, 'utf8'));
		}
		
		// BUG: Files may have wrong background https://github.com/electron/electron/issues/40207
		if (!intercept) return callback({});
		
		ses.protocol.handle('file', async () => {
			ses.protocol.unhandle('file');
			
			return new Response(await intercept!(), {
				headers: { 'content-type': 'text/html' }
			});
		});
		
		return callback({ redirectURL: req.url });
	});
}