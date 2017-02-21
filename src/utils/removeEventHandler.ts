function removeEventHandler(el: HTMLInputElement | Element, event: string, handler: (ev: UIEvent) => void) {
    if (el.removeEventListener) {
        el.removeEventListener(event, handler);
    } else {
        let elem = <IElementWithDettachEvent>el;
        if (elem.detachEvent) {
            elem.detachEvent('on' + event, handler);
        } else {
            elem[event] = null;
        }
    }
}

interface IElementWithDettachEvent extends HTMLElement {
    [key: string]: Function | Object | string | void | null | number | boolean;
    detachEvent: (event: string, handler: (ev: UIEvent) => void) => void;
}