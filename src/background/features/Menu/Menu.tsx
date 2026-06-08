import NavigationItem from "./NavigationItem";
import { ReactElement, useEffect, useRef, useState } from "react";
import Footer from "../Footer/Footer";
import Help from "./Help";

const Menu = (): ReactElement => {
    const [isOpen, setIsOpen] = useState<boolean>(true);
    const [accordionHeight, setAccordionHeight] = useState<number>(0);
    const [toggleHeight, setToggleHeight] = useState<number>(0);
    const toggleRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const accordionDOM = document.querySelector(".accodion");
        if (accordionDOM) {
            setAccordionHeight(accordionDOM.scrollHeight);
        }

        if (toggleRef.current) {
            setToggleHeight(toggleRef.current.offsetHeight);
        }
    }, [])


    // 「設定を閉じる/開く」を押す度に、トグルバー + アコーディオン部分の高さだけwindowサイズをリサイズする
    const changeWindowSize = (toggleIsOpen: boolean) => {
        const resizeHeight = accordionHeight + toggleHeight;
        const currentTimeDom = document.getElementById("adjustimer-current-time");
        const minInnerHeightForTimer = currentTimeDom
            ? Math.ceil(currentTimeDom.getBoundingClientRect().bottom + 60)
            : 0;

        if (toggleIsOpen) {
            window.resizeTo(window.outerWidth, window.outerHeight + resizeHeight);
        } else {
            const targetInnerHeight = Math.max(window.innerHeight - resizeHeight, minInnerHeightForTimer);
            const delta = targetInnerHeight - window.innerHeight;
            window.resizeTo(window.outerWidth, window.outerHeight + delta);
        }
        setIsOpen(toggleIsOpen)
    }

    return (
        <>
            {isOpen && (
                <div
                    ref={toggleRef}
                    onClick={() => changeWindowSize(false)}
                    className="
                        w-screen
                        bg-gray-100
                        text-center
                        py-5
                        cursor-pointer
                ">
                    ▽設定を閉じる
                </div>
            )}

            {!isOpen && (
                <div
                    onClick={() => changeWindowSize(true)}
                    className="
                        fixed
                        top-2
                        right-2
                        z-50
                        px-3
                        py-1
                        rounded-md
                        bg-gray-100
                        border
                        border-gray-300
                        text-sm
                        cursor-pointer
                        shadow
                "
                >
                    △設定を開く
                </div>
            )}

            <div className={"mt-auto accodion " + (isOpen ? "visible" : "hidden")}>
                <div className="w-9/10 mb-3 text-center mx-auto">
                    <div className="overflow-hidden">
                        <div className="
                            flex
                            space-x-5
                            mt-3
                            p-3
                            font-sans
                            tracking-widest
                        ">
                            <Help />
                            <NavigationItem />
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </>
    )
}

export default Menu