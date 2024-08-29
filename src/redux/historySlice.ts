import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const historySlice = createSlice({
    name: 'history',
    initialState:{lastSection:"",lastTab:""},
    reducers: {
        setLastSection:(state,action:PayloadAction<string>)=>{
            state.lastSection = action.payload;
        },
    },
})

export const { setLastSection} = historySlice.actions


export default historySlice.reducer