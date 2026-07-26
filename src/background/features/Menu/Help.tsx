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
                    <li>「情報を取得する」を押す</li>
                    <li>OBSの設定は、<a href="https://patiopatimon.com/adjustimer/#/obs-setting" target="_blank" className="font-bold text-red-800 underline underline-offset-4">こちら</a>を確認ください。</li>
                    <li>その他仕様は、<a href="https://patiopatimon.com/adjustimer/" target="_blank" className="text-red-800 font-bold underline underline-offset-4">使い方ページ</a>を参考にしてください</li>
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
            <div className="mt-3 max-w-85 min-w-0 overflow-hidden rounded-lg border-2 border-emerald-600 bg-emerald-50 text-left shadow-md shadow-emerald-950/10">
                <div className="flex items-center gap-2 rounded-t-md bg-emerald-600 px-3 py-2 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.45-1.95-1.95a.75.75 0 00-1.06 1.061l2.57 2.57a.75.75 0 001.137-.089l3.753-5.16z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-extrabold">おしらせ</p>
                </div>
                <p className="min-w-0 whitespace-normal break-words px-3 py-3 text-xs font-bold leading-relaxed text-emerald-950">
                    2026/07/27：Amazon Primeの動画プレイヤー仕様変更への対応が完了しました。
                </p>
            </div>
        </div>
    )
}

export default Help;
