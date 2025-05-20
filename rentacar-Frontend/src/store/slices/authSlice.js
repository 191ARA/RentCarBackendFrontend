// authSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    logoutUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
    },
    restoreUser: (state, action) => {
      const user = action.payload;
      if (user) {
        state.user = user;
        state.isAuthenticated = true;
      }
    },
  },
});

export const { setUser, logoutUser, restoreUser } = authSlice.actions;

export default authSlice.reducer;