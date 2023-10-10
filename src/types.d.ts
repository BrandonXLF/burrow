declare module '*.ico'

declare const enum AskForPath {
	Always,
	WhenNeeded,
	Never
}

declare interface TabData {
	mode?: string;
	path?: string;
	text?: string;
	savedText?: string;
}