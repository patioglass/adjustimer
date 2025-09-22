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
            <p className="text-4xl">{currentVideo.title}</p>
            <p className="text-3xl">{currentVideo.subTitle}</p>
            <p className="mt-10 text-6xl">{currentVideo.currentTime}</p>
        </div>
    );
}

export default Timer