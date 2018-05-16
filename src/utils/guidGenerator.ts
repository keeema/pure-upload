function newGuid(): string {
  let d = new Date().getTime();
  /* cSpell:disable*/
  let uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(
    c
  ) {
    /* cSpell:enable*/
    /* tslint:disable */
    let r = ((d + Math.random() * 16) % 16) | 0;
    d = Math.floor(d / 16);
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    /* tslint:enable */
  });
  return uuid;
}
