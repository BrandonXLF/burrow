import '../less/popup.less';

export interface PopupButton {
	text: string | Node;
	click?: () => unknown;
	keepOpen?: boolean;
}

export function popup(
	title: string | Node,
	msg: string | Node|(string | Node)[],
	buttons: PopupButton[] = [{text: 'OK'}],
	parent = document.body,
	small = false,
	onClose?: () => unknown,
	onSubmit?: (() => unknown) | false
) {
	const popupElement = document.createElement('div'),
		text = document.createElement('div'),
		buttonCnt = document.createElement('div');
	
	let	container: HTMLDivElement | undefined;

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

	const topElement = container ?? popupElement;

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

	const closePopup = () => {
		topElement.remove();
		onClose?.();
	};

	buttons.forEach(button => {
		const buttonElement = document.createElement('button');

		buttonElement.append(button.text);
		buttonElement.addEventListener('click', () => {
			button.click?.();
			if (!button.keepOpen) closePopup();
		});
		buttonCnt.append(buttonElement);
	});

	topElement.addEventListener('keydown', e => {
		if (e.key === 'Escape') {
			closePopup();
			return;
		}

		if (onSubmit !== false && (e.key === 'Enter' || e.key === 'NumpadEnter')) {
			onSubmit?.();
			closePopup();
		}
	});

	topElement.tabIndex = -1;
	topElement.focus();

	return closePopup;
}