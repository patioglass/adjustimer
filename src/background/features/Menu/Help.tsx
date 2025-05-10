const Help = () => {
    return (
        <div className="text-left p-3 bg-gray-100">
            <div>
                <p># 更新履歴</p>
                <ul className="list-disc list-inside">
                    <li>デザインを実装した</li>
                    <li>service workerからの起動を実装</li>
                    <li>viteの環境を作成</li>
                </ul>
                <a href="" className="text-rose-400 border-b">⇒過去の更新履歴</a>
            </div>
            <div className="mt-5">
                <p># 使い方</p>
                <ul className="list-decimal list-inside">
                    <li>対象の動画ページを選択する</li>
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