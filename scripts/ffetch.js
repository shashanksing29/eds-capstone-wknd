/* eslint-disable no-await-in-loop, no-restricted-syntax */
/*
 * ffetch — a small helper for lazily fetching and paginating a
 * query-index.json (or any indexed sheet). Ported from the AEM Block
 * Collection reference implementation.
 *
 * Usage:
 *   const entries = await ffetch('/query-index.json')
 *     .filter((row) => row.template === 'article')
 *     .all();
 */

async function* request(url, context) {
  const { chunkSize, sheet } = context;
  for (let offset = 0, total = Infinity; offset < total; offset += chunkSize) {
    const params = new URLSearchParams(`offset=${offset}&limit=${chunkSize}`);
    if (sheet) params.append('sheet', sheet);
    const resp = await fetch(`${url}?${params.toString()}`);
    if (resp.ok) {
      const json = await resp.json();
      total = json.total;
      context.total = total;
      for (const entry of json.data) yield entry;
    } else {
      return;
    }
  }
}

class FFetch {
  constructor(url) {
    this.url = url;
    this.context = { chunkSize: 255, sheet: null, total: Infinity };
    this.operations = [];
  }

  chunkSizeOf(size) {
    this.context.chunkSize = size;
    return this;
  }

  sheet(name) {
    this.context.sheet = name;
    return this;
  }

  async* generator() {
    let entries = request(this.url, this.context);
    for (const op of this.operations) {
      entries = op(entries);
    }
    yield* entries;
  }

  map(fn) {
    const self = this;
    this.operations.push(async function* map(entries) {
      let i = 0;
      for await (const e of entries) {
        yield fn(e, i);
        i += 1;
      }
    });
    return self;
  }

  filter(fn) {
    this.operations.push(async function* filter(entries) {
      let i = 0;
      for await (const e of entries) {
        if (fn(e, i)) yield e;
        i += 1;
      }
    });
    return this;
  }

  limit(n) {
    this.operations.push(async function* limit(entries) {
      let i = 0;
      for await (const e of entries) {
        if (i >= n) return;
        yield e;
        i += 1;
      }
    });
    return this;
  }

  slice(from, to) {
    this.operations.push(async function* slice(entries) {
      let i = 0;
      for await (const e of entries) {
        if (i >= to) return;
        if (i >= from) yield e;
        i += 1;
      }
    });
    return this;
  }

  async all() {
    const result = [];
    for await (const e of this.generator()) {
      result.push(e);
    }
    return result;
  }

  async first() {
    // eslint-disable-next-line no-unreachable-loop
    for await (const e of this.generator()) {
      return e;
    }
    return null;
  }

  [Symbol.asyncIterator]() {
    return this.generator();
  }
}

export function ffetch(url) {
  return new FFetch(url);
}

export default ffetch;
