import { ReactElement } from "react"
import ColorPicker from "./ColorPicker"

const NavigationItem = (): ReactElement => {
    return (
        <div className="
            grid
            grow
            place-content-start
            place-items-start
            break-words
            w-1/2
        ">
            <div className="text-left">
                <p>【- 対象にするページ -】</p>
                <select className="
                    bg-gray-50
                    border
                    border-gray-300
                    text-gray-900
                    text-sm rounded-lg
                    focus:ring-blue-500
                    focus:border-blue-500
                    block
                    p-2.5
                    w-2/3
                    dark:bg-gray-700
                    dark:border-gray-600
                    dark:placeholder-gray-400
                    dark:text-white
                    dark:focus:ring-blue-500
                    dark:focus:border-blue-500"
                >
                    <option value="1" key="tabId1">Amazon.co.jp: 機動戦士Gundam GQuuuuuuX（ジークアクス）を観る | Prime Video</option>
                    <option value="2" key="tabId2">ウィンドウ2</option>
                    <option value="3" key="tabId2">ウィンドウ3</option>
                </select>
            </div>

            <div className="mt-3 text-left">
                <p>【- 動画URL -】</p>
                <p>https://www.amazon.co.jp/gp/video/detail/B0CY9RNB6S/ref=atv_hm_hom_c_YKXMPr_brws_3_1?jic=8%7CEgRzdm9k</p>
            </div>

            <div className="mt-3 text-left">
                <p>【- 表示色の変更 -】</p>
                <ColorPicker />
            </div>

            <div className="
                text-lg
                cursor-pointer
                text-white
                font-extrabold
                rounded-lg
                bg-orange-500
                px-25 py-3
                mt-3
                transition-all
                duration-300
                hover:bg-orange-400
                hover:ring-2
                hover:ring-orange-400
                hover:ring-offset-2
            ">
                情報を取得する
            </div>
        </div>
    )
}

export default NavigationItem