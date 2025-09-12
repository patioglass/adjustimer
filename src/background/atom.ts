import { atom } from "jotai";
import { STORAGE_KEY_BACKGROUND_COLOR, STORAGE_KEY_TEXT_COLOR, VideoState } from "../constants";
import { initialVideoState } from "../content/atom";

export const backgroundColor = atom<string>();
export const textColor = atom<string>();

export const currentVideo = atom<VideoState>(initialVideoState);

export const pipWindow = atom<Window | null>(null);
export const isPipWindowSupported = atom<boolean>("documentPictureInPicture" in window);

export const port = atom<any>();

export const getBackgroundColor = atom(
    (get) => get(backgroundColor),
    (get, set, newColor: string) => {
        chrome.storage.local.set({[STORAGE_KEY_BACKGROUND_COLOR]: newColor})
            .then(() => {
                set(backgroundColor, newColor);
            });
    }
);

export const getTextColor = atom(
    (get) => get(textColor),
    (get, set, newColor: string) => {
        chrome.storage.local.set({[STORAGE_KEY_TEXT_COLOR]: newColor})
            .then(() => {
                set(textColor, newColor);
            });
    }
)

export const getCurrentVideo = atom(
    (get) => get(currentVideo),
    (get, set, update: VideoState) => {
        set(currentVideo, update);
    }
)

export const getPort = atom(
    (get) => get(port),
    (get, set, updatePort: any) => {
        set(port, updatePort);
    }
)

export const getPipWindow = atom(
    (get) => get(pipWindow),
    (get, set, update: Window | null) => {
        set(pipWindow, update);
    }
)