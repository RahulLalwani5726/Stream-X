import { createSlice } from '@reduxjs/toolkit'
const initialState = {
    isLoggedIn : false,
    userData : null
}

const authSlice = createSlice({
    name:"authSlice",
    initialState,
    reducers:{
        Login: (state , action) =>{
            state.isLoggedIn = true;
            state.userData = action.payload
        },
        Logout: (state) => {
            state.isLoggedIn = false;
            state.userData = null;
        }
    }
})
export const { Login , Logout } = authSlice.actions;

export default authSlice;