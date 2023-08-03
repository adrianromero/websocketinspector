import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../app/store";
import { FunctionComponent } from "react";
import LoggingList from "../LoggingList";
import ClientList from "../ClientList";
import ClientInfo from "../ClientInfo";
import ClientMessages from "../ClientMessages";

export type View = "logging" | "clients" | "client" | "clientinfo" | "unknown";

export type Address = {
    view: View;
    path?: string;
};

export interface UIState {
    address: Address;
    title: string;
}

export type ViewElement = {
    view: View;
    label: string;
    Component: FunctionComponent<{ path?: string }>;
};

export const routes: ViewElement[] = [
    { view: "logging", label: "Events log", Component: LoggingList },
    { view: "clients", label: "Clients", Component: ClientList },
    { view: "client", label: "Client", Component: ClientMessages },
    { view: "clientinfo", label: "Client information", Component: ClientInfo },
];
const unknownroute: ViewElement = {
    view: "unknown",
    label: "Unknown view",
    Component: () => null,
};
export const getRoute = (view: View) =>
    routes.find(route => view === route.view) || unknownroute;

const initialState: UIState = {
    address: {
        view: "clients",
    },
    title: "",
};

export const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        navigate: (state, action: PayloadAction<Address>) => {
            state.title = "";
            state.address = action.payload;
        },
        setTitle: (state, action: PayloadAction<string>) => {
            state.title = action.payload;
        },
    },
});

export const { navigate, setTitle } = uiSlice.actions;

export const selectAddress = (state: RootState) => state.ui.address;
export const selectTitle = (state: RootState) => state.ui.title;

export default uiSlice.reducer;
