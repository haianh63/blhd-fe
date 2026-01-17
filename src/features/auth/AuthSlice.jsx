import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  accessToken: "",
  role: "",
  studentId: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    changeAuthCredential: (state, action) => {
      state.accessToken = action.payload["access_token"];
      state.role = action.payload["role"];
      state.studentId = action.payload["student_id"];
    },

    resetAuthCredential: (state) => {
      state.accessToken = "";
      state.role = "";
      state.studentId = "";
    },
  },
});

export const { changeAuthCredential, resetAuthCredential } = authSlice.actions;

export default authSlice.reducer;
