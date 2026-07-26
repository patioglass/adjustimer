import { ReactElement, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import ColorPicker from "./ColorPicker"
import { ADJUSTIMER_WINDOW_SET_TAB_ID, ADJUSTIMER_WINDOW_UPDATE, CUSTOM_FONTS, isTargetUrl, TabInfo } from "../../../constants";
import { useAtom } from "jotai";
import { getCountdownDuration, getCountdownEndsAt, getCountdownRemaining, getCountdownRunning, getCurrentVideo, getCustomFont, getPort, getTimeFontSize, getTimerMode, getTitleFontSize, getTitleOffsetY, TimerMode } from "../../atom";

type StopwatchInputPart = "hours" | "minutes" | "seconds";

const NavigationItem = (): ReactElement => {
    const [ port, setPort ] = useAtom(getPort);
    const [ currentVideo, setCurrentVideo ] = useAtom(getCurrentVideo);
    const [ selectTabs, setSelectTabs ] = useState<Array<TabInfo>>();
    const [ selectItems, setSelectItems ] = useState<Array<any>>();
    const [ initLoading, setInitLoading ] = useState<boolean>(false);
    const [ customFont, setCustomFont] = useAtom(getCustomFont);
    const [ titleFontSize, setTitleFontSize ] = useAtom(getTitleFontSize);
    const [ timeFontSize, setTimeFontSize ] = useAtom(getTimeFontSize);
    const [ titleOffsetY, setTitleOffsetY ] = useAtom(getTitleOffsetY);
    const [ isTextSettingsModalOpen, setIsTextSettingsModalOpen ] = useState<boolean>(false);
    const [ timerMode, setTimerMode ] = useAtom(getTimerMode);
    const [ , setCountdownDuration ] = useAtom(getCountdownDuration);
    const [ countdownRemaining, setCountdownRemaining ] = useAtom(getCountdownRemaining);
    const [ countdownRunning, setCountdownRunning ] = useAtom(getCountdownRunning);
    const [ countdownEndsAt, setCountdownEndsAt ] = useAtom(getCountdownEndsAt);
    const [ editingInputPart, setEditingInputPart ] = useState<StopwatchInputPart | null>(null);
    const [ inputDraft, setInputDraft ] = useState<string>("");

    const countdownSign = countdownRemaining < 0 ? -1 : 1;
    const absoluteCountdown = Math.abs(countdownRemaining);
    const countdownHours = countdownSign * Math.floor(absoluteCountdown / 3600);
    const countdownMinutes = countdownSign * Math.floor((absoluteCountdown % 3600) / 60);
    const countdownSeconds = countdownSign * (absoluteCountdown % 60);

    const changeTimerMode = (mode: TimerMode) => {
        setTimerMode(mode);
    };

    const updateCountdownDuration = (part: StopwatchInputPart, value: number) => {
        const safeValue = Number.isFinite(value) ? Math.floor(value) : 0;
        const nextHours = part === "hours" ? Math.min(Math.max(safeValue, -99), 99) : countdownHours;
        const nextMinutes = part === "minutes" ? Math.min(Math.max(safeValue, -59), 59) : countdownMinutes;
        const nextSeconds = part === "seconds" ? Math.min(Math.max(safeValue, -59), 59) : countdownSeconds;
        const nextDuration = nextHours * 3600 + nextMinutes * 60 + nextSeconds;
        setCountdownRunning(false);
        setCountdownEndsAt(null);
        setCountdownDuration(nextDuration);
        setCountdownRemaining(nextDuration);
    };

    const updateStopwatchInput = (part: StopwatchInputPart, value: string) => {
        setInputDraft(value);
        if (/^-?\d+$/.test(value)) {
            updateCountdownDuration(part, Number(value));
        }
    };

    const finishStopwatchInput = (part: StopwatchInputPart) => {
        if (/^-?\d+$/.test(inputDraft)) {
            updateCountdownDuration(part, Number(inputDraft));
        }
        setEditingInputPart(null);
        setInputDraft("");
    };

    const toggleCountdown = () => {
        if (countdownRunning) {
            const pausedRemaining = countdownEndsAt === null
                ? countdownRemaining
                : Math.floor((Date.now() - countdownEndsAt) / 1000);
            setCountdownRemaining(pausedRemaining);
            setCountdownRunning(false);
            setCountdownEndsAt(null);
            return;
        }

        setCountdownEndsAt(Date.now() - countdownRemaining * 1000);
        setCountdownRunning(true);
    };

    const adjustCountdown = (delta: number) => {
        const nextRemaining = countdownRemaining + delta;
        setCountdownRemaining(nextRemaining);
        if (countdownRunning) {
            setCountdownEndsAt((countdownEndsAt ?? Date.now()) - delta * 1000);
        }
    };

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

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsTextSettingsModalOpen(false);
            }
        };

        if (isTextSettingsModalOpen) {
            window.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isTextSettingsModalOpen]);

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
            <div className={`grid transition-all duration-500 ${timerMode === "video" ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className={`min-h-0 overflow-hidden transition-transform duration-500 ${timerMode === "video" ? "translate-x-0" : "-translate-x-full"}`}>
            <div className="text-left w-100">
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
                <p
                    className="line-clamp-3 max-w-85 break-all"
                    title={currentVideo.url || ""}
                >
                    {currentVideo.url}
                </p>
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
            </div>

            <div className="mt-3 text-left">
                <p className="text-xl font-bold">【- 設定の変更 -】</p>
                <div className="relative mt-5 w-85 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left shadow-sm">
                    <div className="absolute -top-5 left-3 flex flex-col items-start">
                        <span className="rounded-md bg-rose-500 px-2 py-1 text-[10px] font-extrabold tracking-wide text-white shadow-sm">
                            新機能
                        </span>
                        <span className="ml-3 h-0 w-0 border-x-4 border-t-4 border-x-transparent border-t-rose-500"></span>
                    </div>
                    <p className="mb-2 text-xs font-extrabold text-slate-600">タイマーモード</p>
                    <div className="grid grid-cols-2 rounded-lg bg-slate-200 p-1">
                        <button
                            type="button"
                            onClick={() => changeTimerMode("video")}
                            className={`cursor-pointer rounded-md px-3 py-2 text-sm font-bold transition-all duration-300 ${timerMode === "video" ? "bg-white text-blue-700 shadow" : "text-slate-500"}`}
                        >
                            動画連動
                        </button>
                        <button
                            type="button"
                            onClick={() => changeTimerMode("countdown")}
                            className={`cursor-pointer rounded-md px-3 py-2 text-sm font-bold transition-all duration-300 ${timerMode === "countdown" ? "bg-white text-emerald-700 shadow" : "text-slate-500"}`}
                        >
                            緊急用タイマー
                        </button>
                    </div>

                    <div className={`grid transition-all duration-500 ${timerMode === "countdown" ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                        <div className="min-h-0 overflow-hidden">                            
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { label: "時", part: "hours" as const, value: countdownHours, max: 99 },
                                    { label: "分", part: "minutes" as const, value: countdownMinutes, max: 59 },
                                    { label: "秒", part: "seconds" as const, value: countdownSeconds, max: 59 },
                                ].map(({ label, part, value, max }) => (
                                    <label key={part} className="text-center text-xs font-bold text-slate-600">
                                        <input
                                            type="number"
                                            min={part === "hours" ? -99 : -59}
                                            max={max}
                                            value={editingInputPart === part ? inputDraft : value}
                                            onFocus={(event) => {
                                                setEditingInputPart(part);
                                                setInputDraft(event.currentTarget.value);
                                            }}
                                            onChange={(event) => updateStopwatchInput(part, event.target.value)}
                                            onBlur={() => finishStopwatchInput(part)}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter") event.currentTarget.blur();
                                            }}
                                            className="mb-1 w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-center text-base font-bold text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                                        />
                                        {label}
                                    </label>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={toggleCountdown}
                                className="mt-3 w-full cursor-pointer rounded-lg bg-emerald-600 px-3 py-2.5 font-extrabold text-white transition-colors hover:bg-emerald-500"
                            >
                                {countdownRunning ? "Ⅱ 一時停止" : "▶ 開始"}
                            </button>
                            <p>通常のストップウォッチ機能です。情報取得がうまくいかない場合などにご利用ください。</p>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                <button type="button" onClick={() => adjustCountdown(-1)} className="cursor-pointer rounded-lg border border-emerald-600 bg-white py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-50">◀ 1秒戻す</button>
                                <button type="button" onClick={() => adjustCountdown(1)} className="cursor-pointer rounded-lg border border-emerald-600 bg-white py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-50">1秒進める ▶</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-3 inline-block">
                    <button
                        type="button"
                        className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                        onClick={() => setIsTextSettingsModalOpen(true)}
                    >
                        文字の設定 ▷
                    </button>
                </div>
            </div>
            {isTextSettingsModalOpen && createPortal(
                <div
                    className="absolute inset-0 z-50 flex items-center bg-black/30"
                    onClick={() => setIsTextSettingsModalOpen(false)}
                >
                    <div
                        className="h-95 w-full align-middle overflow-y-auto bg-white p-5 text-left shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
                            <p className="text-lg font-extrabold text-slate-800">文字の設定</p>
                            <button
                                type="button"
                                className="rounded-md border border-slate-300 px-3 py-1 text-sm font-bold text-slate-700 hover:bg-slate-100"
                                onClick={() => setIsTextSettingsModalOpen(false)}
                            >
                                設定を閉じる
                            </button>
                        </div>

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

                        <div className="mt-3 flex items-center gap-2">
                            <div className="flex items-center gap-2">
                                <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-white shadow-sm">NEW</span>
                                <span className="align-middle">タイトル文字サイズ：{titleFontSize === 0 ? "非表示" : `${titleFontSize}px`}</span>
                            </div>
                            <input
                                type="range"
                                className="align-middle w-40"
                                min={0}
                                max={60}
                                value={titleFontSize}
                                onChange={(e) => setTitleFontSize(Number(e.target.value))}
                            />
                        </div>

                        <div className="mt-2 flex items-center gap-2">
                            <div className="flex items-center gap-2">
                                <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-white shadow-sm">NEW</span>
                                <span className="align-middle">時間文字サイズ：{timeFontSize}px</span>
                            </div>
                            <input
                                type="range"
                                className="align-middle w-40"
                                min={24}
                                max={160}
                                value={timeFontSize}
                                onChange={(e) => setTimeFontSize(Number(e.target.value))}
                            />
                        </div>

                        <div className="mt-2 flex items-center gap-2">
                            <div className="flex items-center gap-2">
                                <span className="align-middle">タイトル位置（上下）：{titleOffsetY}px</span>
                            </div>
                            <input
                                type="range"
                                className="align-middle w-40"
                                min={-120}
                                max={120}
                                value={titleOffsetY}
                                onChange={(e) => setTitleOffsetY(Number(e.target.value))}
                            />
                        </div>

                        <div className="mt-3">
                            <ColorPicker />
                        </div>
                    </div>
                </div>,
                document.querySelector(".accodion") as Element
            )}
        </div>
    )
}

export default NavigationItem
