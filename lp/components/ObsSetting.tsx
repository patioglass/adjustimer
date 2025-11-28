import { ReactElement } from "react";
import Navigation from "./Navigation";
import obsSetting1 from '../../public/obs-setting-01.jpg'
import obsSetting2 from '../../public/obs-setting-02.jpg'
import obsSetting3 from '../../public/obs-setting-03.jpg'

const ObsSetting = ():ReactElement => {
    return (
        <div className="min-h-screen font-sans">
            <Navigation />
            {/* Features */}
            <h2 className="text-3xl font-bold mt-25 text-center">
                <p>OBSの設定</p>
                <p className="text-sm">- obs-setting -</p>
            </h2>
            <section className="py-20 px-8 text-left lg:w-3/5 m-auto">
                <div className="p-6 rounded-sm">
                    <p>
                        <h3 className="text-xl font-semibold mb-2">ウィンドウキャプチャのやり方</h3>
                        <p>1. 「ソース追加」⇒「ウィンドウキャプチャ」</p>
                        <p>2. AdjusTimerの「ポップアップを表示させる」（ピンクのボタン）を押す</p>
                        <p>3. ウィンドウキャプチャのウィンドウ選択で、ポップアウトしたものを選択する。</p>
                        <img src={obsSetting1} className="w-1/2 m-auto" />
                        <br />
                        <p>4. 「AdjusTimer -ポップアウト-」があるので、「AdjusTimer -ポップアウト-」を選ぶ。</p>
                        <p>「AdjusTimer -ポップアウト-」が2つあるが、どちらを選んでも同じ</p>
                        <p>5. 「ウィンドウのタイトルに一致する必要があります」を選ぶ。</p>
                        <img src={obsSetting2} className="w-1/2 m-auto" />
                        <br />
                        この設定で、OBSの立ち上げ時にポップアウトのウィンドウを使ったキャプチャ配信が可能となります。
                    </p>
                </div>
                <div className="p-6 rounded-sm">
                    <h3 className="text-xl font-semibold mb-2">クロマキー(背景透明)設定</h3>
                    <p>さきほど追加した「ウィンドウキャプチャ」を右クリック⇒「フィルタ」⇒「クロマキー」を追加</p>
                    <p>デフォルトだと緑が透明対象のため、AdjusTimer側の背景色を緑にする</p>
                    <img src={obsSetting3} className="w-1/2 m-auto" />
                </div>
            </section>
        </div>
    );
};

export default ObsSetting;