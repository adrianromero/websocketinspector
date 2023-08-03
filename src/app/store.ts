import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import websocketReducer from "../features/websocketSlice";
import uiReducer from "../features/uiSlice";

export const store = configureStore({
    reducer: {
        websocket: websocketReducer,
        ui: uiReducer,
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
