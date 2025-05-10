import { ReactElement } from "react";

const ColorPicker = (): ReactElement => {
    return (
        <div className="border p-3 text-center">
            <div className="">
                <span className="mr-2 text-xs align-middle">背景色の変更 ⇒</span>
                <input
                    role="button"
                    type="color"
                    className="w-7 align-middle cursor-pointer"
                    value={"#ffffff"}
                />
            </div>
            
            <span className="mr-2 align-middle">文字色の変更 ⇒</span>
            <input
                role="button"
                type="color"
                className="w-7 align-middle cursor-pointer"
                value={"#000000"}
            />
        </div>
    )
}

export default ColorPicker;