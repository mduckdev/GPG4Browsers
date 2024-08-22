import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store';
export interface IPublicKey {
    keyValue:string,
    userID:string,
    name:string,
    email:string,
    fingerprint:string
}

const initialState: IPublicKey[] = []
export const publicKeySlice = createSlice({
    name: 'publicKeyList',
    initialState:initialState,
    reducers: {
        addPublicKey:(state,action:PayloadAction<IPublicKey>)=>{
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
        deletePublicKey:(state,action:PayloadAction<string>)=>{
            state = state.filter((element)=>{
                return element.fingerprint !== action.payload;
            })
        },
        editPublicKey:(state,action:PayloadAction<IPublicKey>)=>{
            state.forEach(e=>{
                if(e.fingerprint===action.payload.fingerprint){
                    e.keyValue=action.payload.keyValue;
                }
            })
        },

    },
})

export const { addPublicKey,deletePublicKey } = publicKeySlice.actions

//export const getPublicKeyByFingerprint = (state: RootState, fingerprint:string) => state.publicKeys.filter(e=>e.fingerprint===fingerprint)


export default publicKeySlice.reducer