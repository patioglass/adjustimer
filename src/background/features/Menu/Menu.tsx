import NavigationItem from "./NavigationItem";
import { ReactElement, useEffect, useState } from "react";
import Footer from "../Footer/Footer";
import Help from "./Help";

const Menu = (): ReactElement => {
    const [isOpen, setIsOpen] = useState<boolean>(true);
    const [accordionHeight, setAccordionHeight] = useState<number>(0);

    useEffect(() => {
        const accordionDOM = document.querySelector(".accodion");
        if (accordionDOM) {
            setAccordionHeight(accordionDOM.scrollHeight);
        }
    }, [])


    // 「設定を閉じる/開く」を押す度に、アコーディオン部分の高さだけwindowサイズをリサイズする
    const changeWindowSize = (toggleIsOpen: boolean) => {
        if (toggleIsOpen) {
            window.resizeTo(window.outerWidth, window.outerHeight + accordionHeight);
        } else {
            window.resizeTo(window.outerWidth, window.outerHeight - accordionHeight);
        }
        setIsOpen(toggleIsOpen)
    }

    return (
        <>
            <div
                onClick={() => changeWindowSize(!isOpen)}
                className="
                    w-screen
                    bg-gray-100
                    text-center
                    py-5
                    cursor-pointer
            ">
                ▽設定を{isOpen ? "閉じる" : "開く"}
            </div>
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