import { ReactElement } from "react";

const Title = (): ReactElement => {
    const manifest = chrome.runtime.getManifest();

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
        </header>
    );
}

export default Title