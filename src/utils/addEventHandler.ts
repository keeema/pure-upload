function addEventHandler(el: HTMLInputElement | Element, event: string, handler: (ev: UIEvent) => void, isFileApi: boolean) {
    if (isFileApi) {
        el.addEventListener(event, handler);
    } else {
        var elem = <any>el;
        if (elem.attachEvent) {
            elem.attachEvent('on' + event, handler);
        } else {
            elem[event] = handler;
        }
    }
}
