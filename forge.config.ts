import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

const config: ForgeConfig = {
	packagerConfig: {
		icon: './src/icon/icon'
	},
	rebuildConfig: {},
	makers: [
		new MakerSquirrel({}),
		new MakerZIP({}, ['darwin']),
		new MakerRpm({}),
		new MakerDeb({})
	],
	plugins: [
		new WebpackPlugin({
			devContentSecurityPolicy: '',
			mainConfig,
			renderer: {
				config: rendererConfig,
				entryPoints: [
					{
						nodeIntegration: true,
						html: './src/window/window.html',
						js: './src/window/window.ts',
						name: 'window'
					},
					{
						preload: {
							js: './src/preload.ts'
						},
						name: 'webview'
					}
				]
			}
		})
	]
};

export default config;
