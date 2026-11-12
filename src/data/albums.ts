export type Album = {
  id: string;
  title: string;
  artist: string;
};

const albums: Album[] = [
  { id: "blue", title: "Blue", artist: "Joni Mitchell" },
  { id: "vespertine", title: "Vespertine", artist: "Björk" },
  { id: "hounds", title: "Hounds of Love", artist: "Kate Bush" },
];

// This simulates an async data source. The promise is created by a user action
// and then kept in component state, so the same promise is read on re-renders.
export function createAlbumsPromise(delayMs = 1200): Promise<Album[]> {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (Math.random() > 0.5) reject(new Error("Random error"));
      return resolve(albums)
    }, delayMs);
  });
}
