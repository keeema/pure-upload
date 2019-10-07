function addEventHandler(
  el: Element | HTMLElement,
  event: string,
  handler: EventListenerOrEventListenerObject,
  useCapture: boolean
) {
  if (el.addEventListener) {
    el.addEventListener(event, handler, useCapture);
  } else {
    let elem = <IElementWithEvents>el;
    if (elem.attachEvent) {
      elem.attachEvent("on" + event, handler as EventListener);
    } else {
      elem[event] = handler;
    }
  }
}

interface IElementWithEvents extends HTMLElement {
  [key: string]: Function | Object | string | void | null | number | boolean;
  attachEvent: (event: string, handler: (ev: UIEvent) => void) => void;
}
