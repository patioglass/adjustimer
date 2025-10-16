import imgUrl from "../../../../public/extension_32.png";
import Title from "./Title";

const Help = () => {
    return (
        <div className="p-3 bg-gray-100">
            <Title />
            <div className="text-left mt-5">
                <p className="text-xl"><img className="inline align-top" src={imgUrl} /># 使い方</p>
                <hr />
                <br />
                <ul className="list-decimal list-inside">
                    <li>対象の動画ページを開く</li>
                    <li>右のメニューから対象の動画ページを選択する</li>
                    <li>動画URLと一致しているかを確認する</li>
                    <li>色のパレット部分を選択し、UIを好みに合わせる</li>
                    <li>「情報を取得する」を押す</li>
                    <li>うまく取得できない場合は、<a href="https://patiopatimon.com/adjustimer/" target="_blank" className="text-red-800 font-bold underline underline-offset-4">使い方ページ</a>を参考にしてください</li>
                </ul>
            </div>
            <div className="mt-3">
                <a
                    href="https://patiopatimon.com/adjustimer/"
                    target="_blank"
                    className="
                        text-xs
                        text-white
                        rounded-lg
                        bg-violet-500
                        px-5 py-1.5
                        mt-1
                        transition-all
                        hover:bg-violet-300
                        hover:ring-2
                        hover:bg-violet-300
                        hover:ring-offset-2
                        inline
                ">
                    ▶要望/報告フォーム
                </a>
            </div>
        </div>
    )
}

export default Help;