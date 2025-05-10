import { ReactElement } from "react";
import Timer from "./Timer/Timer";

import "../../style.css";
import Menu from "./Menu/Menu";

export const AdjusTimerWindow = (): ReactElement => {
    return (
        <div className="flex flex-col h-screen">
            <Timer />
            <Menu />
        </div>
    )
}