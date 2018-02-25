function getValueOrResult<T>(valueOrGetter?: T | (() => T)): T | undefined {
  if (typeof valueOrGetter === "function") return valueOrGetter();

  return valueOrGetter;
}
