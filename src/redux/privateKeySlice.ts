import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store';
interface IPrivateKey {
    privateKeyName:string,
    privateKeyValue:string,
    userID:string,
    fingerprint:string
}

const initialState: IPrivateKey[] = []
export const privateKeySlice = createSlice({
    name: 'privateKeyList',
    initialState:initialState,
    reducers: {
        addPrivateKey:(state,action:PayloadAction<IPrivateKey>)=>{
            state.push({privateKeyName:action.payload.privateKeyName,privateKeyValue:action.payload.privateKeyValue,userID:action.payload.userID,fingerprint:action.payload.fingerprint})
        },
        deleteprivateKey:(state,action:PayloadAction<IPrivateKey>)=>{
            
        },
        editprivateKey:(state,action:PayloadAction<IPrivateKey>)=>{
            
        },

    },
})

export const { addPrivateKey } = privateKeySlice.actions

//export const selectValues = (state: RootState, index: number) => state.privateKey[index]

export default privateKeySlice.reducer