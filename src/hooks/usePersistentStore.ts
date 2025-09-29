import { create, StateCreator, StoreApi } from 'zustand';
import { produce } from 'immer';
type State = Record<string, any>;
type StateSetter<T extends State> = (
  partial: Partial<T> | ((state: T) => Partial<T> | void),
  replace?: boolean
) => void;
type StateGetter<T extends State> = () => T;
const localStorageMiddleware = <T extends State>(
  config: (set: StateSetter<T>, get: StateGetter<T>, api: StoreApi<T>) => T,
  key: string
): StateCreator<T> => (set, get, api) => {
  const newSet: StateSetter<T> = (args, replace) => {
    // The `replace` parameter is removed from the call to `set` to fix the TS overload error.
    set(typeof args === 'function' ? (produce(args) as any) : args);
    try {
      localStorage.setItem(key, JSON.stringify(get()));
    } catch (e) {
      console.error(`Error saving to localStorage for key "${key}":`, e);
    }
  };
  const initialState = config(newSet, get, api);
  let storedState: Partial<T> = {};
  try {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
      storedState = JSON.parse(storedValue);
    }
  } catch (e) {
    console.error(`Error reading from localStorage for key "${key}":`, e);
  }
  return { ...initialState, ...storedState };
};
export const createPersistentStore = <T extends State>(
  config: (set: StateSetter<T>, get: StateGetter<T>, api: StoreApi<T>) => T,
  key: string
) => create<T>(localStorageMiddleware(config, key));