import { atom } from 'jotai';

export interface UserInfo {
  uid: string;
  email: string;
  [key: string]: any; // Add more fields as needed
}

export const userAtom = atom<UserInfo | null>(null);