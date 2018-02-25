function removeEventHandler(
  el: HTMLInputElement | Element,
  event: string,
  handler: EventListenerOrEventListenerObject
) {
  if (el.removeEventListener) {
    el.removeEventListener(event, handler);
  } else {
    let elem = <IElementWithDettachEvent>el;
    if (elem.detachEvent) {
      elem.detachEvent("on" + event, handler as EventListener);
    } else {
      elem[event] = null;
    }
  }
}

interface IElementWithDettachEvent extends HTMLElement {
  [key: string]: Function | Object | string | void | null | number | boolean;
  detachEvent: (event: string, handler: (ev: UIEvent) => void) => void;
}
