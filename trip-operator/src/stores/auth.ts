import { create } from "zustand";
import { produce, Draft } from "immer";
import { User } from "../models/user";

export interface AuthState {
  token?: string;
  user?: User;
  isValidating: boolean;
  set: (cb: (state: Draft<AuthState>) => void) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: undefined,
  user: undefined,
  isValidating: true,
  set: (cb: (state: Draft<AuthState>) => void) => {
    set(produce(cb));
  },
}));
