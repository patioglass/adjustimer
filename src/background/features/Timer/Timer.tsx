import { useAtom } from "jotai";
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_TEXT_COLOR } from "../../../constants";
import { getBackgroundColor, getCurrentVideo, getTextColor } from "../../atom";

const Timer = () => {
    const [ currentVideo, setCurrentVideo ] = useAtom(getCurrentVideo);
    const [ backgroundColor, setBackgroundColor ] = useAtom(getBackgroundColor);
    const [ textColor, setTextColor ] = useAtom(getTextColor);

    return (
        <div className="
            p-24
            w-screen
            font-sans
            text-center
            font-extrabold
            grow"
            style={{
                backgroundColor: backgroundColor ? backgroundColor : DEFAULT_BACKGROUND_COLOR,
                color: textColor ? textColor : DEFAULT_TEXT_COLOR
            }}
        >
            {currentVideo.isAdBreak && (
                <div>
                    <span className="
                        py-1
                        px-1.5
                        inline-flex
                        items-center
                        gap-x-1
                        text-xs
                        font-medium
                        bg-red-100
                        text-red-800
                        rounded-full
                        dark:bg-red-500/10
                        dark:text-red-500
                    ">
                        <svg className="shrink-0 size-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                            <path d="M12 9v4"></path>
                            <path d="M12 17h.01"></path>
                        </svg>
                        広告再生中 - 残り:＜{currentVideo.adBreakRemainTime}＞
                    </span>
                </div>
            )}

            <p className="text-4xl">{currentVideo.title}</p>
            <p className="text-3xl">{currentVideo.subTitle}</p>
            <p className="mt-10 text-6xl">{currentVideo.currentTime}</p>
        </div>
    );
}

export default Timer