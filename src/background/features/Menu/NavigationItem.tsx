import { ReactElement, useEffect, useState } from "react"
import ColorPicker from "./ColorPicker"
import { ADJUSTIMER_WINDOW_SET_TAB_ID, ADJUSTIMER_WINDOW_UPDATE, CUSTOM_FONTS, isTargetUrl, TabInfo } from "../../../constants";
import { useAtom } from "jotai";
import { getCurrentVideo, getCustomFont, getPort, getShadowColor, getShadowSize, isShowCurrentDate, shadowSize } from "../../atom";

const NavigationItem = (): ReactElement => {
    const [ port, setPort ] = useAtom(getPort);
    const [ currentVideo, setCurrentVideo ] = useAtom(getCurrentVideo);
    const [ selectTabs, setSelectTabs ] = useState<Array<TabInfo>>();
    const [ selectItems, setSelectItems ] = useState<Array<any>>();
    const [ initLoading, setInitLoading ] = useState<boolean>(false);
    const [ customFont, setCustomFont] = useAtom(getCustomFont);
    const [ showCurrentDate, setShowCurrentDate ] = useAtom(isShowCurrentDate);

    /**
     * 現在のタブを取得して、selectを更新する
     */
    const setTabList = () => {
        let newSelectTabs: Array<TabInfo> = [];
        chrome.tabs.query({})
            .then((tabs) => {
                tabs.forEach((tab) => {
                    let newTab: TabInfo = new TabInfo();
                    if (tab && isTargetUrl(tab.url)) {
                        newTab.id = tab.id;
                        newTab.title = tab.title;
                        newTab.activeTab = tab.active;
                        newSelectTabs.push(newTab);
                    }
                })
            }).finally(() => {
                setSelectTabs(newSelectTabs);
            })
    }

    const tabEvent = (tabId: number, changeInfo: any, tab: any) => {
        if (changeInfo.status === "complete" || changeInfo.status === "loading" || changeInfo.title) {
            setTabList();
        }
    }

    useEffect(() => {
        setTabList();
        // タブが新規で作られたらタブリストを更新する
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => tabEvent(tabId, changeInfo, tab));
        chrome.tabs.onRemoved.addListener(setTabList);

        // フォントを全読み込み
        CUSTOM_FONTS.forEach((font) => {
            const fontParam = font.replace(/ /g, "+");
            const linkId = `customGoogleFontLink_${fontParam}`;
            let link = document.getElementById(linkId) as HTMLLinkElement | null;
            if (!link) {
                link = document.createElement("link");
                link.id = linkId;
                link.rel = "stylesheet";
                document.head.appendChild(link);
            }
            link.href = `https://fonts.googleapis.com/css2?family=${fontParam}:wght@400;700&display=swap`;
        })
        return () => {
            chrome.tabs.onUpdated.removeListener((tabId, changeInfo, tab) => tabEvent(tabId, changeInfo, tab));
            chrome.tabs.onRemoved.removeListener(setTabList);
        }
    }, [])

    /**
     * タブの新規作成、削除などが行われた場合に(setTabListの実行後)、selectの中身を再度セットする
     */
    useEffect(() => {
        const updateSelectTabs =  selectTabs?.map((tab) => {
                                    return (
                                        <option value={tab.id} key={tab.id}>
                                            {tab.title}
                                        </option>
                                    )
                                })
        if (updateSelectTabs && updateSelectTabs.length > 0) {
            // 最初開いた画面の初期選択状態のものをservice workerに送信
            if (!initLoading) {
                port.postMessage({
                    action: ADJUSTIMER_WINDOW_SET_TAB_ID,
                    tabId: updateSelectTabs[0].key
                });
                setInitLoading(true);
            }
            setSelectItems(updateSelectTabs);
        } else {
            setSelectItems([<option key="0" value="0">取得できるURLが開かれていません</option>])
        }
    }, [selectTabs])

    const handleChangeUrl = () => {}

    /**
     * 「情報を取得する」を押したら、情報の更新をservice workerに伝える
     */
    const handleClickUpdate = () => {
        const currentSelector: HTMLSelectElement | null = document.querySelector("select option:checked")
        if (currentSelector && currentSelector.value != "0") {
            port.postMessage({
                action: ADJUSTIMER_WINDOW_SET_TAB_ID,
                tabId: currentSelector.value
            });
            port.postMessage({
                action: ADJUSTIMER_WINDOW_UPDATE,
                tabId: currentSelector.value
            });
            if (!initLoading) {
                setInitLoading(true);
            }
        }
    }

    return (
        <div className="
            grid
            grow
            place-content-start
            place-items-start
            break-words
            w-1/2
        ">
            <div className="text-left w-100">
                <input
                    id="checked-checkbox"
                    type="checkbox"
                    checked={showCurrentDate}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    onChange={(e) => setShowCurrentDate(e.target.checked)}
                />
                <label className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">現在時刻（タイマー左）を表示する</label>
                <p className="text-xl font-bold mt-3">【- 対象にするページ -】</p>
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
                    w-85
                    dark:bg-gray-700
                    dark:border-gray-600
                    dark:placeholder-gray-400
                    dark:text-white
                    dark:focus:ring-blue-500
                    dark:focus:border-blue-500"
                    onChange={handleChangeUrl}
                >
                    {selectItems}
                </select>
            </div>

            <div className="mt-3 text-left w-100">
                <p>{currentVideo.url}</p>
            </div>

            <div className="mt-3 text-left">
                <p className="text-xl font-bold">【- 文字の変更 -】</p>
                <div className="mt-3">
                    <span className="mr-2">フォント を選択：</span>
                    <select
                        className="border p-1"
                        value={customFont}
                        style={{fontFamily: customFont}}
                        onChange={(e) => setCustomFont(e.target.value)}
                    >
                    {CUSTOM_FONTS.map((f) => (
                        <option
                            key={f}
                            value={f}
                            style={{fontFamily: f}}
                        >
                                {f}|({currentVideo.currentTime})
                        </option>
                    ))}
                    </select>
                </div>

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
                hover:ring-offset-2"
                onClick={handleClickUpdate}
            >
                情報を取得する
            </div>
        </div>
    )
}

export default NavigationItem