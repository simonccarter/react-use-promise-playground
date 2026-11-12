import { use } from "react";
import type { Album } from "../data/albums";

// A small domain wrapper: consumers ask for albums rather than remembering
// that the input is a promise that must be unwrapped with React.use.
export function useAlbums(albumsPromise: Promise<Album[]>): Album[] {
  return use(albumsPromise);
}
