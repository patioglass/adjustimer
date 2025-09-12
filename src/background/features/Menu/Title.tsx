import { ReactElement } from "react";
import { useAtomCallback } from 'jotai/utils'
import { useAtom } from "jotai";
import { isPipWindowSupported, pipWindow } from "../../atom";
import Timer from "../Timer/Timer";
import { createPortal } from "react-dom";
import { useCallback } from "react";

const Title = (): ReactElement => {
    const manifest = chrome.runtime.getManifest();
    const [ isSupported, setIsPipWindowSupported ] = useAtom(isPipWindowSupported);
    const [ pip, setPiP ] = useAtom(pipWindow)

    const openPipWindow = useAtomCallback(
        useCallback(async (get, set) => {
            const pw = await window.documentPictureInPicture?.requestWindow({
                width: 700,
                height: 350,
                disallowReturnToOpener: false,
                preferInitialWindowPlacement: false,
            });
            if (!pw) return;
            set(pipWindow, pw);
            // スクロールバーを消す CSS を追加
            const style = pw.document.createElement("style");
            style.textContent = `
                html, body {
                    margin: 0;
                    padding: 0;
                    overflow: hidden; /* スクロールバー非表示 */
                }
            `;
            pw.document.head.appendChild(style);
            pw.document.title = "AdjusTimer -PinP-";
            // ユーザーが PiP ウィンドウを閉じたときにstateを更新する
            pw.addEventListener("pagehide", () => {
                set(pipWindow, null);
            });
          
            // 親ページのスタイルをコピーする
            Array.from(document.styleSheets).forEach((styleSheet) => {
            try {
                const cssRules = Array.from(styleSheet.cssRules)
                .map((rule) => rule.cssText)
                .join("");
                const style = document.createElement("style");
        
                style.textContent = cssRules;
                pw?.document.head.appendChild(style);
            } catch (_) {
                const link = document.createElement("link");
                if (styleSheet.href == null) {
                return;
                }
        
                link.rel = "stylesheet";
                link.type = styleSheet.type;
                link.media = styleSheet.media.toString();
                link.href = styleSheet.href;
                pw.document.head.appendChild(link);
            }
            });
        }, [])
    )
    const handleOpenPipWindow = () => {
        openPipWindow();
    }
    return (
        <header className="
            font-mono
        ">
            <h1 className="
                text-2xl
                font-bold
                mt-3
            ">
                AdjusTimer(アジャスタイマー)
                Ver. {manifest.version}
            </h1>
            {isSupported  ? (
                <p className="
                        text-xs
                        text-white
                        rounded-lg
                        bg-rose-500
                        px-5 py-1.5
                        mt-1
                        w-1/2
                        transition-all
                        duration-300
                        hover:bg-rose-400
                        hover:ring-2
                        hover:ring-rose-400
                        hover:ring-offset-2
                        cursor-pointer
                        mx-auto
                    "
                   onClick={handleOpenPipWindow}>▶ポップアップ表示させる<br />（ピクチャーインピクチャー）</p>)
            : (<div></div>)}
            {pip && createPortal(
                <Timer />,
                pip.document.body,
            )}
        </header>
    );
}

export default Title