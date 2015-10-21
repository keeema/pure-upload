function removeEventHandler(el: HTMLInputElement | Element, event: string, handler: (ev: UIEvent) => void, isFileApi: boolean) {
    if (isFileApi) {
        el.removeEventListener(event, handler);
    } else {
        var elem = <any>el;
        if (elem.detachEvent) {
            elem.detachEvent('on' + event, handler);
        } else {
            elem[event] = null;
        }
    }
}
