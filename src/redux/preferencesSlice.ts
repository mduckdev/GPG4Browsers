import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { preferences } from '@src/types';
import { RootState } from './store';

const defaultState:preferences = {
    defaultSigningKeyFingerprints:[],
    defaultEncryptionKeyFingerprints:[],
    askAboutUpdatingKey:true,
    keyServers:["https://keys.openpgp.org","https://keys.mailvelope.com"],
    detectMessages:true,
    language:""
}

export const preferencesSlice = createSlice({
    name: 'preferences',
    initialState:defaultState,
    reducers: {
        setDefaultSigningKey:(state,action:PayloadAction<string[]>)=>{
            state.defaultSigningKeyFingerprints = action.payload;
        },
        setAskAboutUpdatingKey:(state,action:PayloadAction<boolean>)=>{
            state.askAboutUpdatingKey = action.payload;
        },
        setKeyServers:(state,action:PayloadAction<string[]>)=>{
            state.keyServers = action.payload;
        },
        setPreferences:(state,action:PayloadAction<preferences>)=>{
            return action.payload;
        }
    },
})

export const { setDefaultSigningKey, setAskAboutUpdatingKey, setKeyServers ,setPreferences} = preferencesSlice.actions

export const getDetectMessages = (state: RootState) => state.preferences.detectMessages;

export default preferencesSlice.reducer