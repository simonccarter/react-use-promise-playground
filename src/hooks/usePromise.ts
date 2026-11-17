import { use } from "react";

export function usePromise<T>(promise: Promise<T>){
  return use(promise)
}