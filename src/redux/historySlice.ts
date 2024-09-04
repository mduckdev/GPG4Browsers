import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const historySlice = createSlice({
    name: 'history',
    initialState:{lastSection:"",lastTab:""},
    reducers: {
        setLastSection:(state,action:PayloadAction<string>)=>{
            state.lastSection = action.payload;
        },
        setLastTab:(state,action:PayloadAction<string>)=>{
            state.lastTab = action.payload;
        },
    },
})

export const { setLastSection, setLastTab} = historySlice.actions


export default historySlice.reducer