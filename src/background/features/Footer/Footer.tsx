import { ReactElement } from "react";

const Footer = (): ReactElement => {
    return (
        <footer className="
            text-center
            bg-cyan-600
            p-4
            text-white
        ">
            不具合があった場合は、
            <a
                href="https://x.com/adjustimer"
                target="_blank"
                className="
                    text-yellow-100
                    visited:text-purple-600
                    underline
                "
            >
                公式Twitter
            </a>
            などで気軽にお問い合わせください。
            <div className="
                policy
                place-items-center
                font-sans
            ">
                <span>
                    (
                        <a
                            href="https://patiopatimon.com/adjustimer/privacy.html"
                            target="_blank"
                            className="
                                text-yellow-100
                                visited:text-purple-600
                                underline
                            "
                        >プライバシーポリシー
                        </a>)
                </span>
            </div>
        </footer>
    )
}

export default Footer;