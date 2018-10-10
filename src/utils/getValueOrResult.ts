function getValueOrResult<T>(valueOrGetter?: T | (() => T)): T | undefined {
  if (isGetter(valueOrGetter)) return valueOrGetter();

  return valueOrGetter;
}

function isGetter<T>(
  valueOrGetter?: T | (() => T)
): valueOrGetter is (() => T) {
  return typeof valueOrGetter === "function";
}
