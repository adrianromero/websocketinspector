import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import websocketReducer from "../features/websocketSlice";

export const store = configureStore({
    reducer: {
        websocket: websocketReducer,
    },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;
