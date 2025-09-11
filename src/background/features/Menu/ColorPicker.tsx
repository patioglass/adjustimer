import { ReactElement } from "react";
import { useAtom } from "jotai";
import { getBackgroundColor, getTextColor } from "../../atom";
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_TEXT_COLOR } from "../../../constants";

const ColorPicker = (): ReactElement => {
    const [ backgroundColor, setBackgroundColor ] = useAtom(getBackgroundColor);
    const [ textColor, setTextColor ] = useAtom(getTextColor);

    const handleUpdateBackGroundColor = (backgroundColor: string) => {
        setBackgroundColor(backgroundColor);
    }

    const handleUpdateTextColor = (textColor: string) => {
        setTextColor(textColor);
    }
    return (
        <div className="border p-3 text-center">
            <div className="">
                <span className="mr-2 text-xs align-middle">背景色の変更 ⇒</span>
                <input
                    role="button"
                    type="color"
                    className="w-7 align-middle cursor-pointer"
                    value={backgroundColor ? backgroundColor : DEFAULT_BACKGROUND_COLOR}
                    onChange={(e) => handleUpdateBackGroundColor(e.target.value)}
                />
            </div>
            
            <span className="mr-2 align-middle">文字色の変更 ⇒</span>
            <input
                role="button"
                type="color"
                className="w-7 align-middle cursor-pointer"
                value={textColor ? textColor : DEFAULT_TEXT_COLOR}
                onChange={(e) => handleUpdateTextColor(e.target.value)}
            />
        </div>
    )
}

export default ColorPicker;