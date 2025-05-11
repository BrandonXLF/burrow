export function emittedOnce(element: HTMLElement, eventName: string): Promise<boolean> {
	return new Promise(resolve =>
		element.addEventListener(eventName, () => resolve(true), {once: true})
	);
}