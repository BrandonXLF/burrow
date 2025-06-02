import { popup } from './popup';
import SettingStore from '../../utils/SettingStore';
import Tabs from '../Tabs';
import Tab from '../Tab';

export default async function promptUnsaved(tabOrTabs: Tabs | Tab, settings: SettingStore): Promise<boolean> {
	const tabsToClose = tabOrTabs instanceof Tabs ? tabOrTabs.tabs : [tabOrTabs];

	let unsaved = tabsToClose.filter(tab => tab.unsaved);
	
	if (unsaved.length && settings.get('autoSave')) {
		await Promise.allSettled(unsaved.map(tab => tab.save(SaveType.Auto)));
		unsaved = tabsToClose.filter(tab => tab.unsaved);
	}

	if (!unsaved.length) return true;

	return new Promise(resolve => {
		const save = async () => {
			const results = await Promise.all(unsaved.map(tab => tab.save()));
			resolve(results.every(saved => saved));
		};

		popup(
			'Unsaved changes!',
			unsaved.length > 1
				? 'You have unsaved tabs, would you like to save them now?'
				: 'Tab has unsaved changes, would you like to save them now?',
			[
				{
					text: unsaved.length > 1 ? 'Save All' : 'Save',
					click: save
				},
				{
					text: 'Don\'t Save',
					click: () => resolve(true)
				},
				{
					text: 'Cancel'
				}
			],
			undefined,
			false,
			() => resolve(false),
			save
		);
	});
}