import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_TEXT_COLOR, DEFAULT_TIME_FONT_SIZE, DEFAULT_TITLE_FONT_SIZE, generateTextShadow } from "../../../constants";
import { getBackgroundColor, getCurrentVideo, getCustomFont, getFontWeight, getShadowColor, getShadowSize, getTextColor, getTimeFontSize, getTitleFontSize } from "../../atom";

const TITLE_LINE_COUNT = 2;
const TITLE_LINE_COUNT_LARGE = 3;
const TITLE_LINE_COUNT_SINGLE = 1;
const TITLE_LINE_HEIGHT = 1.2;
const MIN_TITLE_FONT_SIZE = 12;
const TITLE_FONT_SIZE_THRESHOLD = 50;
const TITLE_SPLIT_SEPARATORS = [" - ", "｜", "|", "：", ":", " / ", "・", " "];

const splitTitleByPackedFirstLine = (title: string, maxWidth: number, ctx: CanvasRenderingContext2D): [string, string] => {
    const normalized = (title || "").trim();
    if (!normalized) return ["", ""];
    if (normalized.length <= 1 || ctx.measureText(normalized).width <= maxWidth) return [normalized, ""];

    let low = 1;
    let high = normalized.length - 1;
    let bestFit = 1;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const candidate = normalized.slice(0, mid).trimEnd();
        if (!candidate) {
            low = mid + 1;
            continue;
        }

        if (ctx.measureText(candidate).width <= maxWidth) {
            bestFit = mid;
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }

    let splitIndex = bestFit;
    for (const sep of TITLE_SPLIT_SEPARATORS) {
        const sepIdx = normalized.lastIndexOf(sep, bestFit - 1);
        if (sepIdx > 0) {
            const candidateIdx = sepIdx + sep.length;
            const candidateFirst = normalized.slice(0, candidateIdx).trim();
            if (candidateFirst && ctx.measureText(candidateFirst).width <= maxWidth) {
                splitIndex = candidateIdx;
                break;
            }
        }
    }

    const first = normalized.slice(0, splitIndex).trim();
    const second = normalized.slice(splitIndex).trim();
    return [first, second];
};

const splitTitleToThreeLines = (title: string): [string, string, string] => {
    const normalized = (title || "").trim();
    if (!normalized) return ["", "", ""];
    if (normalized.length <= 2) return [normalized, "", ""];

    const firstCut = Math.max(1, Math.floor(normalized.length / 3));
    const secondCut = Math.max(firstCut + 1, Math.floor((normalized.length * 2) / 3));

    const first = normalized.slice(0, firstCut).trim();
    const second = normalized.slice(firstCut, secondCut).trim();
    const third = normalized.slice(secondCut).trim();

    return [first, second, third];
};

const Timer = () => {
    const [ currentVideo, setCurrentVideo ] = useAtom(getCurrentVideo);
    const [ backgroundColor, setBackgroundColor ] = useAtom(getBackgroundColor);
    const [ textColor, setTextColor ] = useAtom(getTextColor);
    const [ customFont, setCustomFont] = useAtom(getCustomFont);
    const [ shadowSize, setShadowSize] = useAtom(getShadowSize);
    const [ shadowColor, setShadowColor] = useAtom(getShadowColor);
    const [ fontWeight, setFontWeight ] = useAtom(getFontWeight);
    const [ titleFontSize, setTitleFontSize ] = useAtom(getTitleFontSize);
    const [ timeFontSize, setTimeFontSize ] = useAtom(getTimeFontSize);
    const requestedTitleFontSize = titleFontSize ?? DEFAULT_TITLE_FONT_SIZE;
    const [ adjustedTitleFontSize, setAdjustedTitleFontSize ] = useState<number>(DEFAULT_TITLE_FONT_SIZE);
    const [ titleTwoLines, setTitleTwoLines ] = useState<string>("");
    const [ titleLineCount, setTitleLineCount ] = useState<number>(TITLE_LINE_COUNT);
    const titleWrapRef = useRef<HTMLDivElement | null>(null);
    const titleRef = useRef<HTMLParagraphElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        setAdjustedTitleFontSize(requestedTitleFontSize);
    }, [titleFontSize, currentVideo.title]);

    useEffect(() => {
        const titleWrap = titleWrapRef.current;
        const normalizedTitle = currentVideo.title || "";

        if (requestedTitleFontSize === 0) {
            setAdjustedTitleFontSize(0);
            setTitleLineCount(TITLE_LINE_COUNT_SINGLE);
            setTitleTwoLines("");
            return;
        }

        if (!titleWrap) {
            setAdjustedTitleFontSize(requestedTitleFontSize);
            return;
        }

        const adjustTitleFontSize = () => {
            if (!canvasRef.current) {
                canvasRef.current = document.createElement("canvas");
            }
            const ctx = canvasRef.current.getContext("2d");
            if (!ctx) {
                setAdjustedTitleFontSize(requestedTitleFontSize);
                return;
            }

            const maxWidth = titleWrap.clientWidth;
            ctx.font = `${fontWeight * 100} ${requestedTitleFontSize}px ${customFont}`;
            const singleLineFits = ctx.measureText(normalizedTitle).width <= maxWidth;

            const findLargestFittingFontSize = (lines: string[]) => {
                let nextCandidate = requestedTitleFontSize;

                while (nextCandidate > MIN_TITLE_FONT_SIZE) {
                    ctx.font = `${fontWeight * 100} ${nextCandidate}px ${customFont}`;
                    const maxLineWidth = Math.max(...lines.map((line) => ctx.measureText(line).width));
                    if (maxLineWidth <= maxWidth) {
                        return nextCandidate;
                    }
                    nextCandidate -= 1;
                }

                ctx.font = `${fontWeight * 100} ${MIN_TITLE_FONT_SIZE}px ${customFont}`;
                const minSizeMaxWidth = Math.max(...lines.map((line) => ctx.measureText(line).width));
                return minSizeMaxWidth <= maxWidth ? MIN_TITLE_FONT_SIZE : null;
            };

            const twoLineCandidates = singleLineFits
                ? [normalizedTitle]
                : splitTitleByPackedFirstLine(normalizedTitle, maxWidth, ctx);

            const twoLineFontSize = findLargestFittingFontSize(twoLineCandidates);

            let candidateLines = twoLineCandidates;
            let candidateLineCount = singleLineFits ? TITLE_LINE_COUNT_SINGLE : TITLE_LINE_COUNT;
            let candidate = twoLineFontSize ?? MIN_TITLE_FONT_SIZE;

            if (!singleLineFits) {
                const threeLineCandidates = splitTitleToThreeLines(normalizedTitle);
                const threeLineFontSize = findLargestFittingFontSize(threeLineCandidates);

                if (threeLineFontSize !== null && (twoLineFontSize === null || threeLineFontSize > twoLineFontSize)) {
                    candidateLines = threeLineCandidates;
                    candidateLineCount = TITLE_LINE_COUNT_LARGE;
                    candidate = threeLineFontSize;
                } else if (twoLineFontSize !== null) {
                    candidate = twoLineFontSize;
                }
            }

            setTitleLineCount(candidateLineCount);
            setTitleTwoLines(candidateLines.join("\n"));
            setAdjustedTitleFontSize(candidate);
        };

        adjustTitleFontSize();

        const resizeObserver = new ResizeObserver(() => {
            adjustTitleFontSize();
        });
        resizeObserver.observe(titleWrap);

        window.addEventListener("resize", adjustTitleFontSize);
        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", adjustTitleFontSize);
        };
    }, [requestedTitleFontSize, currentVideo.title, customFont, fontWeight]);

    return (
        <div className="
            pt-5
            pb-15
            w-screen
            h-screen
            font-sans
            text-center
            font-extrabold
            grow"
            style={{
                backgroundColor: backgroundColor ? backgroundColor : DEFAULT_BACKGROUND_COLOR,
            }}
        >
            {currentVideo.isAdBreak && (
                <div>
                    <span className="
                        py-1
                        px-3
                        inline-flex
                        items-center
                        gap-x-1
                        text-xs
                        font-medium
                        bg-red-100
                        text-red-800
                        rounded-full
                    ">
                        <svg className="shrink-0 size-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                            <path d="M12 9v4"></path>
                            <path d="M12 17h.01"></path>
                        </svg>
                        <span className="text-sm">広告再生中 - 残り : {currentVideo.adBreakRemainTime}</span>
                    </span>
                </div>
            )}

            <div
                className={requestedTitleFontSize === 0 ? "flex h-full flex-col justify-center" : undefined}
                style={{
                    color: textColor ? textColor : DEFAULT_TEXT_COLOR,
                    fontFamily: customFont,
                    fontWeight: fontWeight * 100,
                    textShadow: generateTextShadow(shadowSize, shadowColor),
                }}
            >
                {requestedTitleFontSize > 0 && (
                    <>
                        <div
                            ref={titleWrapRef}
                            style={{
                                height: `${Math.ceil(60 * TITLE_LINE_COUNT_LARGE * TITLE_LINE_HEIGHT)}px`,
                                overflow: "hidden",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <p
                                ref={titleRef}
                                style={{
                                    fontSize: `${adjustedTitleFontSize}px`,
                                    lineHeight: `${TITLE_LINE_HEIGHT}`,
                                    whiteSpace: "pre-line",
                                    overflowWrap: "anywhere",
                                    wordBreak: "break-word",
                                    margin: 0,
                                }}
                            >
                                {titleTwoLines}
                            </p>
                        </div>
                        <p
                            style={{
                                fontSize: `${Math.max(adjustedTitleFontSize - 8, 12)}px`,
                                marginTop: "4px",
                                marginBottom: 0,
                            }}
                        >
                            {currentVideo.subTitle}
                        </p>
                    </>
                )}

                <div className="relative">
                    <p
                        id="adjustimer-current-time"
                        className={`${requestedTitleFontSize === 0 ? "mt-0" : "mt-2"} flex h-25 items-center justify-center`}
                        style={{ fontSize: `${timeFontSize ?? DEFAULT_TIME_FONT_SIZE}px` }}
                    >
                        {currentVideo.currentTime}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Timer