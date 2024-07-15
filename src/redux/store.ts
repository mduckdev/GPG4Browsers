import { combineReducers, configureStore } from '@reduxjs/toolkit';
import browser from 'webextension-polyfill';
import publicKeyReducer from './publicKeySlice';
import { useDispatch,TypedUseSelectorHook, useSelector } from 'react-redux';
import privateKeyReducer from './privateKeySlice';

const saveToBrowserStorage = (state:RootState) => {
  try {
    const serialisedState = JSON.stringify(state);
    browser.storage.local.set({"persistantState": serialisedState});
  } catch (e) {
    console.warn(e);
  }
};

const loadFromBrowserStorage = async () => {
  try {
    const serialisedState = await browser.storage.local.get("persistantState");
    if (!serialisedState.persistantState) return undefined;
    return JSON.parse(serialisedState.persistantState);
  } catch (e) {
    console.warn(e);
    return undefined;
  }
};

const rootReducer = combineReducers({
  publicKeys: publicKeyReducer,
  privateKeys:privateKeyReducer
});

const tempStore = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof tempStore.getState>;
export type AppDispatch = typeof tempStore.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>() 
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector.withTypes<RootState>()


export const storeBootstrap = async () => {
  const preloadedState = await loadFromBrowserStorage();
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: preloadedState
  });
  store.subscribe(() => saveToBrowserStorage(store.getState()));

  return store;
};
