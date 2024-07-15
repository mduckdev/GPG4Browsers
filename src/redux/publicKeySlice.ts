import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store';
interface IPublicKey {
    publicKeyName:string,
    publicKeyValue:string,
    userID:string,
    fingerprint:string
}

const initialState: IPublicKey[] = []
export const publicKeySlice = createSlice({
    name: 'publicKeyList',
    initialState:initialState,
    reducers: {
        addPublicKey:(state,action:PayloadAction<IPublicKey>)=>{
            state.push({publicKeyName:action.payload.publicKeyName,publicKeyValue:action.payload.publicKeyValue,userID:action.payload.userID,fingerprint:action.payload.fingerprint})
        },
        deletePublicKey:(state,action:PayloadAction<IPublicKey>)=>{
            
        },
        editPublicKey:(state,action:PayloadAction<IPublicKey>)=>{
            
        },

    },
})

export const { addPublicKey } = publicKeySlice.actions

//export const selectValues = (state: RootState, index: number) => state.publicKey[index]

export default publicKeySlice.reducer