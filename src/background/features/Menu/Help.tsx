import imgUrl from "../../../../public/extension_48.png";

const Help = () => {
    return (
        <div className="p-3 bg-gray-100">
            <img className="mx-auto" src={imgUrl} />
            <div className="text-left mt-5">
                <p># 使い方</p>
                <ul className="list-decimal list-inside">
                    <li>対象の動画ページを開く</li>
                    <li>右のメニューから対象の動画ページを選択する</li>
                    <li>動画URLと一致しているかを確認する</li>
                    <li>色のパレット部分を選択し、UIを好みに合わせる</li>
                    <li>「情報を取得する」を押す</li>
                    <li>うまく取得できない場合は、Q&amp;Aページを参考にしてください</li>
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
                        bg-rose-500
                        px-5 py-1.5
                        mt-1
                        transition-all
                        duration-300
                        hover:bg-rose-400
                        hover:ring-2
                        hover:ring-rose-400
                        hover:ring-offset-2
                ">
                    ▶使い方/Q&amp;Aページへ
                </a>
            </div>
        </div>
    )
}

export default Help;