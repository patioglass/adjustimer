import { ReactElement, useEffect, useState } from "react"
import ColorPicker from "./ColorPicker"
import { ADJUSTIMER_WINDOW_SET_TAB_ID, ADJUSTIMER_WINDOW_UPDATE, isTargetUrl, TabInfo, videoProps } from "../../../constants";

const NavigationItem = (props: videoProps): ReactElement => {
    const { currentVideo, port } = props;
    const [ selectTabs, setSelectTabs ] = useState<Array<TabInfo>>();
    const [ selectItems, setSelectItems ] = useState<Array<any>>();
    const [ initLoading, setInitLoading ] = useState<boolean>(false);
    
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
                    w-full
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

            <div className="mt-3 text-left">
                <p>【- 動画URL -】</p>
                <p>{currentVideo.url}</p>
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
                hover:ring-offset-2"
                onClick={handleClickUpdate}
            >
                情報を取得する
            </div>
        </div>
    )
}

export default NavigationItem