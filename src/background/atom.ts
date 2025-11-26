import { atom } from "jotai";
import { CUSTOM_FONTS, DEFAULT_FONT_WEIGHTS, DEFAULT_TEXT_COLOR, STORAGE_KEY_BACKGROUND_COLOR, STORAGE_KEY_FONT_WEIGHT, STORAGE_KEY_FONTFAMILIY, STORAGE_KEY_SHADOW_COLOR, STORAGE_KEY_SHADOW_SIZE, STORAGE_KEY_TEXT_COLOR, VideoState } from "../constants";
import { initialVideoState } from "../content/atom";

export const backgroundColor = atom<string>();
export const textColor = atom<string>();

export const currentVideo = atom<VideoState>(initialVideoState);

export const pipWindow = atom<Window | null>(null);
export const isPipWindowSupported = atom<boolean>("documentPictureInPicture" in window);

export const port = atom<any>();
export const customFont = atom<string>(CUSTOM_FONTS[0]);
export const shadowSize = atom<number>(0);
export const shadowColor = atom<string>(DEFAULT_TEXT_COLOR);
export const fontWeight = atom<number>(5);
export const currentDate = atom<Date>(new Date());
export const showCurrentDate = atom<boolean>(true);

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

export const getCustomFont = atom(
    (get) => get(customFont),
    (get, set, newFont: string | null) => {
        chrome.storage.local.set({[STORAGE_KEY_FONTFAMILIY]: newFont})
            .then(() => {
                set(customFont, newFont ? newFont : CUSTOM_FONTS[0]);
            });
    }
)

export const getShadowSize = atom(
    (get) => get(shadowSize),
    (get, set, newShadowSize: number | null) => {
        chrome.storage.local.set({[STORAGE_KEY_SHADOW_SIZE]: newShadowSize})
            .then(() => {
                set(shadowSize, newShadowSize ? newShadowSize : 0);
            });
    }
)

export const getShadowColor = atom(
    (get) => get(shadowColor),
    (get, set, newShadowColor: string | null) => {
        chrome.storage.local.set({[STORAGE_KEY_SHADOW_COLOR]: newShadowColor})
            .then(() => {
                set(shadowColor, newShadowColor ? newShadowColor : DEFAULT_TEXT_COLOR);
            });
    }
)

export const getFontWeight = atom(
    (get) => get(fontWeight),
    (get, set, newFontWeight: number | null) => {
        chrome.storage.local.set({[STORAGE_KEY_FONT_WEIGHT]: newFontWeight})
            .then(() => {
                set(fontWeight, newFontWeight ? newFontWeight : DEFAULT_FONT_WEIGHTS);
            });
    }
)