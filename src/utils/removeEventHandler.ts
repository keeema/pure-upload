function removeEventHandler(
  el: HTMLInputElement | Element,
  event: string,
  handler: EventListenerOrEventListenerObject
) {
  if (el.removeEventListener) {
    el.removeEventListener(event, handler);
  } else {
    let elem = <IElementWithDetachEvent>el;
    if (elem.detachEvent) {
      elem.detachEvent("on" + event, handler as EventListener);
    } else {
      elem[event] = null;
    }
  }
}

interface IElementWithDetachEvent extends HTMLElement {
  [key: string]: Function | Object | string | void | null | number | boolean;
  detachEvent: (event: string, handler: (ev: UIEvent) => void) => void;
}
