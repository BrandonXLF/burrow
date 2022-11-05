declare module '*.png'

declare enum AskForPath {
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