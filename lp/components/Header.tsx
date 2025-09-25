import type { ReactElement } from "react";
import demo from "../../public/docs_image01.png"

const Header = (): ReactElement => {
    return (
        <div
            className="
                w-full
                bg-gray-100
                bg-opacity-50
            "
            >
            <div
                className="grid grid-cols-1 lg:grid-cols-2 m-auto items-center justify-center w-4/5 py-13"
            >
                <div className="text-center flex-1">
                    <h1 className="text-4xl font-semibold lg:text-6xl mb-5 mt-15">
                        AdjusTimer
                    </h1>
                    <div className="text-gray-700 text-xl mb-2">
                        配信者向け同時視聴用アプリ<br />
                        <p className="text-gray-700 text-sm mb-2">(Chrome 拡張)</p>
                    </div>
                    <div className="text-center">
                        <a href="https://twitter.com/share"
                            className="twitter-share-button m-auto"
                            data-hashtags="AdjusTimer"
                            data-url="https://patiopatimon.com/adjustimer"
                            data-text="AdjusTimer - 同時視聴配信用タイマー(chrome拡張)"
                        >Tweet</a>
                    </div>
                    
                    <p className="text-gray-700 mb-8 mt-10">
                        Prime Video / dアニメストアなど動画サイトの<br />
                        本編の再生時間を表示するタイマーアプリ
                    </p>

                    <a
                        href="https://chromewebstore.google.com/detail/adjustimer/cbolehniipnbcbmecpekldhjhnohifpm"
                        target="_blank"
                        className="
                            group relative inline-flex h-[calc(48px+8px)] items-center justify-center rounded-full bg-cyan-500 py-1 pl-6 pr-14 font-medium text-cyan-50
                        "
                    >
                        <span className="z-10 pr-2">インストールはこちら</span>
                        <div className="absolute right-1 inline-flex h-12 w-12 items-center justify-end rounded-full bg-cyan-400 transition-[width] group-hover:w-[calc(100%-8px)]">
                            <div className="mr-3.5 flex items-center justify-center">
                                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-50">
                                    <path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd">
                                    </path>
                                </svg>
                            </div>
                        </div>
                    </a>
                    <div className="text-gray-700 mb-8 mt-3 text-sm">
                        <p>※過去のバージョンは
                            <a className="underline text-cyan-400" href="https://github.com/patioglass/AdjusTimer-v3/releases" target="_blank">こちら</a>
                        </p>
                    </div>
                    <a
                        href="https://www.fanbox.cc/@adjustimer"
                        target="_blank"
                        className="
                            group relative inline-flex h-[calc(38px+5px)] items-center justify-center rounded-full bg-yellow-500 py-1 pl-6 pr-14 font-medium text-cyan-50
                        "
                    >
                        <span className="z-10 text-sm">開発支援（FANBOX）</span>
                        <div className="absolute right-1 inline-flex h-8 w-8 items-center justify-end rounded-full bg-amber-300 transition-[width] group-hover:w-[calc(100%-8px)]">
                            <div className="mr-2 flex items-center justify-center">
                                <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-50">
                                    <path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd">
                                    </path>
                                </svg>
                            </div>
                        </div>
                    </a>
                </div>
                <div className="mt-10 text-xl text-gray-700 mb-8 grid-item">
                    <img src={demo} />
                </div>
            </div>
        </div>
    );
};

export default Header;