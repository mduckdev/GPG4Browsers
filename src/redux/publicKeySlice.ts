import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store';
export interface IPublicKey {
    keyValue:string,
    userID:string,
    fingerprint:string
}

const initialState: IPublicKey[] = []
export const publicKeySlice = createSlice({
    name: 'publicKeyList',
    initialState:initialState,
    reducers: {
        addPublicKey:(state,action:PayloadAction<IPublicKey>)=>{
            state.push({keyValue:action.payload.keyValue,userID:action.payload.userID,fingerprint:action.payload.fingerprint})
        },
        deletePublicKey:(state,action:PayloadAction<string>)=>{
            state = state.filter((element)=>{
                return element.fingerprint !== action.payload;
            })
        },
        editPublicKey:(state,action:PayloadAction<IPublicKey>)=>{
            
        },

    },
})

export const { addPublicKey,deletePublicKey } = publicKeySlice.actions

//export const getPublicKeyByFingerprint = (state: RootState, fingerprint:string) => state.publicKeys.filter(e=>e.fingerprint===fingerprint)


export default publicKeySlice.reducer