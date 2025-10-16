import { ReactElement } from "react";
import { useAtom } from "jotai";
import { getBackgroundColor, getFontWeight, getShadowColor, getShadowSize, getTextColor } from "../../atom";
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_TEXT_COLOR } from "../../../constants";

const ColorPicker = (): ReactElement => {
    const [ backgroundColor, setBackgroundColor ] = useAtom(getBackgroundColor);
    const [ textColor, setTextColor ] = useAtom(getTextColor);
    const [ shadowSize, setShadowSize] = useAtom(getShadowSize);
    const [ shadowColor, setShadowColor] = useAtom(getShadowColor);
    const [ fontWeight, setFontWeight] = useAtom(getFontWeight);

    const handleUpdateBackGroundColor = (backgroundColor: string) => {
        setBackgroundColor(backgroundColor);
    }

    const handleUpdateTextColor = (textColor: string) => {
        setTextColor(textColor);
    }

    const handleUpdateShadowSize = (shadowColor: string) => {
        setShadowColor(shadowColor);
    }
    return (
        <div>
            <div className="mt-1">
                <span className="mr-2 text-xs align-middle">背景色の変更：</span>
                <input
                    role="button"
                    type="color"
                    className="w-7 align-middle cursor-pointer"
                    value={backgroundColor ? backgroundColor : DEFAULT_BACKGROUND_COLOR}
                    onChange={(e) => handleUpdateBackGroundColor(e.target.value)}
                />
            </div>
            <div className="mt-1">
                <span className="mr-2 align-middle">文字色の変更：</span>
                <input
                    role="button"
                    type="color"
                    className="w-7 align-middle cursor-pointer"
                    value={textColor ? textColor : DEFAULT_TEXT_COLOR}
                    onChange={(e) => handleUpdateTextColor(e.target.value)}
                />
                <span className="ml-5 align-middle">文字の太さ：{fontWeight}</span>
                <input
                    type="range"
                    className="align-middle w-28"
                    min={1}
                    max={10}
                    value={fontWeight}
                    onChange={(e) => setFontWeight(Number(e.target.value))}
                />
            </div>
            <div className="mt-1">
                <span className="mr-2 align-middle">縁取色の変更：</span>
                <input
                    role="button"
                    type="color"
                    className="w-7 align-middle cursor-pointer"
                    value={shadowColor ? shadowColor : DEFAULT_TEXT_COLOR}
                    onChange={(e) => handleUpdateShadowSize(e.target.value)}
                />
                <span className="ml-5 align-middle">縁取の太さ：{shadowSize}</span>
                <input
                    type="range"
                    className="align-middle w-28"
                    min={0}
                    max={10}
                    value={shadowSize}
                    onChange={(e) => setShadowSize(Number(e.target.value))}
                />
            </div>
        </div>
    )
}

export default ColorPicker;