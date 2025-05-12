import '../less/popup.less';

export function popup(
	title: string | Node,
	msg: string | Node|(string | Node)[],
	buttons: {text: string | Node, click?: () => unknown, keepOpen?: boolean}[] = [{text: 'OK'}],
	parent = document.body,
	small = false
) {
	const popupElement = document.createElement('div'),
		text = document.createElement('div'),
		buttonCnt = document.createElement('div');
	
	let	container: HTMLDivElement;

	popupElement.classList.add('popup');

	if (small) {
		popupElement.classList.add('mini-popup');

		parent.append(popupElement);
	} else {
		container = document.createElement('div')

		container.className = 'popup-container';
		container.style.cssText = '';

		if (parent !== document.body) {
			container.classList.add('partial');
		}

		container.append(popupElement);
		parent.append(container);
	}

	if (title) {
		const titleElement = document.createElement('h3');

		titleElement.style.cssText = 'margin: 0;';
		titleElement.append(title);
		popupElement.append(titleElement);
	}

	if (Array.isArray(msg)) {
		text.append(...msg);
	} else {
		text.append(msg)
	}

	popupElement.append(text);

	buttonCnt.className = 'popup-buttons';
	popupElement.append(buttonCnt);

	const closePopup = () => container ? container.remove() : popupElement?.remove();

	buttons.forEach(button => {
		const buttonElement = document.createElement('button');

		buttonElement.append(button.text);
		buttonElement.addEventListener('click', () => {
			if (!button.keepOpen) closePopup();

			button.click?.();
		});
		buttonCnt.append(buttonElement);
	});

	return closePopup;
}