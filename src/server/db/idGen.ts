// A monotonic in-process counter. Combined with Date.now(), this makes an id
// unique for the life of the process regardless of how many are generated
// within the same millisecond (Date.now() alone is not enough — many calls
// issued back-to-back, e.g. via Promise.all, can share a millisecond).
let counter = 0;

export function nextId(prefix: string): string {
  const seq = (counter++).toString().padStart(6, '0');
  return `${prefix}-${Date.now()}-${seq}`;
}
