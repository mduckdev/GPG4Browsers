import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store';
export interface IPrivateKey {
    keyValue:string,
    userID:string,
    name:string,
    email:string,
    fingerprint:string
}

interface updatePayload{
    fingerprint:string,
    keyValue:string
}

const initialState: IPrivateKey[] = []
export const privateKeySlice = createSlice({
    name: 'privateKeyList',
    initialState:initialState,
    reducers: {
        addPrivateKey:(state,action:PayloadAction<IPrivateKey>)=>{
            let isUnique = state.filter(e=>e.fingerprint===action.payload.fingerprint).length===0;
            if(isUnique){
                state.push({
                    keyValue:action.payload.keyValue,
                    userID:action.payload.userID,
                    name:action.payload.name,
                    email:action.payload.email,
                    fingerprint:action.payload.fingerprint,
                    })
            }else{
                state = state.map((e)=>{
                    if(e.fingerprint===action.payload.fingerprint){
                        e.keyValue=action.payload.keyValue;
                        e.userID=action.payload.userID;
                        e.name=action.payload.name;
                        e.email=action.payload.email;
                    }
                    return e;
                })
            }
            
        },
        deletePrivateKey:(state,action:PayloadAction<string>)=>{
            return state.filter((element)=>{
                if(element.fingerprint !== action.payload){
                    return element;
                }
            })
        },
        editprivateKey:(state,action:PayloadAction<updatePayload>)=>{
            state.forEach(e=>{
                if(e.fingerprint===action.payload.fingerprint){
                    e.keyValue=action.payload.keyValue;
                }
            })
        },

    },
})

export const { addPrivateKey,deletePrivateKey } = privateKeySlice.actions

//export const getPrivateKeyByFingerprint = (state: RootState, fingerprint:string) => state.privateKeys.filter(e=>e.fingerprint===fingerprint)

export default privateKeySlice.reducer