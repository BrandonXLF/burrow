declare module '*.ico'
declare module '*.md'
declare module '*.png'

declare const enum SaveType {
	SetName,
	Standard,
	Auto
}

declare interface TabData {
	mode?: string;
	path?: string;
	text?: string;
	savedText?: string;
}

declare interface UpdateStatus {
    state: 'checking' | 'unavailable' | 'available' | 'downloading' | 'downloaded' | 'error';
    title: string;
    details: string;
}

declare interface FontData {
	readonly family: string;
	readonly fullName: string;
	readonly postscriptName: string;
	readonly style: string;
}

declare const queryLocalFonts: (() => Promise<ReadonlyArray<FontData>>)