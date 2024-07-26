import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store';
export interface IPrivateKey {
    keyValue:string,
    userID:string,
    fingerprint:string
}

const initialState: IPrivateKey[] = []
export const privateKeySlice = createSlice({
    name: 'privateKeyList',
    initialState:initialState,
    reducers: {
        addPrivateKey:(state,action:PayloadAction<IPrivateKey>)=>{
            state.push({keyValue:action.payload.keyValue,userID:action.payload.userID,fingerprint:action.payload.fingerprint})
        },
        deletePrivateKey:(state,action:PayloadAction<string>)=>{
            state = state.filter((element)=>{
                return element.fingerprint !== action.payload;
            })
        },
        editprivateKey:(state,action:PayloadAction<IPrivateKey>)=>{
            
        },

    },
})

export const { addPrivateKey,deletePrivateKey } = privateKeySlice.actions

//export const getPrivateKeyByFingerprint = (state: RootState, fingerprint:string) => state.privateKeys.filter(e=>e.fingerprint===fingerprint)

export default privateKeySlice.reducer