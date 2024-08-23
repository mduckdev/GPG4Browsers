import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const themeSlice = createSlice({
    name: 'theme',
    initialState:{prefferedTheme:""},
    reducers: {
        setTheme:(state,action:PayloadAction<string>)=>{
            state.prefferedTheme = action.payload;
        },
    },
})

export const { setTheme} = themeSlice.actions


export default themeSlice.reducer