import Header from './Header';
import Navigation from './Navigation';
import primeLogo from '../../public/prime-video-logo-blue-rgb.png';
import danimeLogo from '../../public/danime-logo.png';
import youtubeLogo from '../../public/youtube-logo.png';
import netflixLogo from '../../public/netflix-logo.png';
import niconicoLogo from '../../public/niconico-logo.png';
import tverLogo from '../../public/tver-logo.png';
import unextLogo from '../../public/u-next-logo.png';
import demo1 from '../../public/readme_image01.jpg'
import demo2 from '../../public/readme_image02.jpg'
import { ReactElement } from 'react';
import Footer from './Footer';

const Home =  (): ReactElement => {
  return (
    <div className="min-h-screen font-sans">
        <Navigation />
        <Header />

        {/* Features */}
        <h2 className="text-3xl font-bold mt-25 text-center">
            <p>概要</p>
            <p className="text-sm">- overview -</p>
        </h2>
        <section className="grid md:grid-cols-3 gap-8 px-8 max-w-6xl mx-auto py-10 items-start">
            <div className="p-6">
                <h2 className="text-xl font-bold mb-3">🎯 動画と同期</h2>
                <p className="text-sm/8">
                再生中の動画再生時間をそのまま表示。<br />OBSでキャプチャし、同時視聴用タイマーとしてご活用できます。<br />スキップや一時停止も追従します。
                </p>
            </div>
            <div className="p-6">
                <h2 className="text-xl font-bold mb-6">💻 ポップアップ機能</h2>
                <p className="text-sm/8">
                タイマーをポップアップさせ、最前面に配置する機能。<br />配信中にタイマーを見失わない仕組みとしてご活用ください。
                </p>
            </div>
            <div className="p-6">
                <h2 className="text-xl font-bold mb-3">⏱️ 広告を検出</h2>
                <p className="text-sm/8">
                広告再生中も検知して表示。広告の残り時間を表示します。
                </p>
            </div>
        </section>

        <h2 className="text-3xl font-bold text-center mt-20">
            <p>対応サイト</p>
            <p className="text-xs">- supported -</p>
        </h2>
        <section className="py-20 px-8 text-center text-white w-auto m-auto flex justify-center items-center gap-4">
            <img className="w-30" src={primeLogo} />
            <img className="w-50" src={danimeLogo} />
            <img className="w-50" src={youtubeLogo} />
            <img className="w-50" src={netflixLogo} />
            <img className="w-50" src={niconicoLogo} />
            <img className="w-50" src={tverLogo} />
            <img className="w-50" src={unextLogo} />
        </section>

        {/* How to Use */}
        <h2 className="text-3xl font-bold text-center mt-20">
            <p>使い方</p>
            <p className="text-xs">- usage -</p>
        </h2>
        <section className="py-20 px-8 text-center text-white lg:w-3/5 m-auto">
            <div className="bg-cyan-600 p-6 rounded-sm">
                <h3 className="text-xl font-semibold mb-2">Step 1</h3>
                <p>拡張をインストール後、右クリックから「AdjusTimer」を起動</p>
            </div>
            <div>
                <img src={demo2} className="w-1/2 m-auto" />
            </div>
            <div className="bg-cyan-800 p-6 rounded-sm">
                <h3 className="text-xl font-semibold mb-2">Step 2</h3>
                <p>動画(Prime Video等) を再生</p>
            </div>
            <div className="bg-cyan-900 p-6 rounded-sm">
                <h3 className="text-xl font-semibold mb-2">Step 3</h3>
                <p>AdjusTimerの右側メニュー　(　【- 対象にするページ -】　)　から動画再生タブを選択</p>
            </div>
            <img src={demo1} className="w-1/2 m-auto" />

            <div className="bg-gray-800 p-6 rounded-sm">
                <h3 className="text-xl font-semibold mb-2">Step 4</h3>
                <p>「情報を取得する」を押す</p>
            </div>
            <br />
            <div className="bg-gray-900 p-6 rounded-sm">
                <h3 className="text-xl font-semibold mb-2">その他（OBSの設定等）</h3>
                <p>OBSの設定等、詳細は動画をご確認ください。</p>
            </div>
            <br />
            <iframe width="560" height="315" src="https://www.youtube.com/embed/VYC_IGwp_bc?si=NbJbNQmu0IjkKx59&amp;start=151" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
        </section>

        {/* Q&A */}
        <h2 className="text-3xl font-bold text-center mt-20">
            <p>よくある質問</p>
            <p className="text-xs">- Q & A -</p>
        </h2>
        <section className="py-20 px-8 lg:w-3/5 m-auto">
            <div className="mb-20">
                <h3 className="text-xl font-semibold mb-2">Q. 「情報を取得する」ボタンを押しても反応がない。</h3>
                <p>A. 一度AdjusTimerを閉じ、動画再生ページを更新（F5）してから、再度AdjusTimerを起動をお試しください。</p>
            </div>
            <div className="mb-20">
                <h3 className="text-xl font-semibold mb-2">Q. AdjusTimerはちゃんとタイマーが動いているが、OBS側でタイマーが更新されないことがある</h3>
                <p>A. OBSでキャプチャ配信する際に、AdjusTimerが他ウィンドウと被る形（裏側になっている状態）で配信すると、起きる事象のようです。</p>
                <p>　AdjusTimer中央にある「ポップアップを表示させる（ピクチャーインピクチャー」を利用すれば、常に最前面でAdjusTimerを動かせるため、そちらを活用ください。</p>
            </div>
            <div className="mb-20">
                <h3 className="text-xl font-semibold mb-2">その他の不具合</h3>
                <p>調査させていただきますので、<a href="https://forms.gle/gyDZ7cF7m8mcoNVC9" target="_blank" className="underline text-cyan-400">こちらのフォーム</a>に報告いただけると幸いです。</p>
            </div>
        </section>

        {/* 連絡先 */}
        <h2 className="text-3xl font-bold text-center mt-20">
            <p>連絡先</p>
            <p className="text-xs">- contact -</p>
        </h2>
        <section className="py-20 px-8 lg:w-3/5 m-auto">
            <div className="mb-20">
                <h3 className="text-xl font-semibold mb-2">Twitter(X)</h3>
                 <a className="twitter-timeline" data-lang="ja" data-width="400" data-height="500" data-theme="light" href="https://twitter.com/adjustimer?ref_src=twsrc%5Etfw">Tweets by adjustimer</a> <script async src="https://platform.twitter.com/widgets.js"></script>
            </div>
            <div className="mb-20">
                <h3 className="text-xl font-semibold mb-2">フォーム</h3>
                <p>Googleフォームで各種お問合せを受けさせていただきます。<a href="https://forms.gle/gyDZ7cF7m8mcoNVC9" target="_blank" className="underline text-cyan-400">こちらのフォーム</a>に報告/ご意見等いただけると幸いです。</p>
            </div>
        </section>
        {/* Footer */}
        <Footer />
    </div>
  );
}

export default Home;