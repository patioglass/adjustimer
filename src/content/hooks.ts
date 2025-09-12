import { useEffect } from "react";

/**
 * mutation observer用のhooks、指定した要素の変化を検知
 * @param {HTMLElement} elements 指定する要素
 * @param {callback} callback 検知後に発火するcallback
 */
export const useMutationObserver = (
    elements: any,
    callback: any,
    options = {
        attributes: true,
        characterData: true,
        childList: true,
        subtree: true,
    }
) => {
    useEffect(() => {
        // DOMが見つかるまで探す

        if (elements) {
            const observer = new MutationObserver(callback);
            return () => observer.disconnect();
        }
    }, []);
};
  