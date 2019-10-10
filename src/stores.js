import { writable } from 'svelte/store';
export const guess = writable(0);
export const loss = writable(0);
export const playing = writable(false)