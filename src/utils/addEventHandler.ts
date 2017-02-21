function addEventHandler(el: HTMLInputElement | Element, event: string, handler: (ev: UIEvent) => void) {
    if (el.addEventListener) {
        el.addEventListener(event, handler);
    } else {
        let elem = <IElementWithAttachEvent>el;
        if (elem.attachEvent) {
            elem.attachEvent('on' + event, handler);
        } else {
            elem[event] = handler;
        }
    }
}

interface IElementWithAttachEvent {
    attachEvent?: (event: string, handler: (ev: UIEvent) => void) => void;
}