import { ReactElement } from "react";

const Footer = (): ReactElement => {
    return (
        <footer className="bg-gray-800 text-center mx-auto text-white">
            <div className="py-10 grid md:grid-cols-3 gap-8 px-8 max-w-6xl mx-auto">
            <div className="p-6 text-left">
                <h2 className="text-lg font-bold mb-3">AdjusTimerについて</h2>
                <ul className="text-sm/8">
                <li><a href="">利用規約</a></li>
                <li><a href="">プライバシーポリシー</a></li>
                </ul>
            </div>
            <div className="p-6 text-left">
                <h2 className="text-lg font-bold mb-3">その他</h2>
                <ul className="text-sm/8">
                <li><a href="">アップデート情報</a></li>
                </ul>
            </div>
            <div className="p-6 text-left">
                <h2 className="text-lg font-bold mb-3">連絡先</h2>
                <ul className="text-sm/8">
                <li><a href="">Twitter(X) @adjustimer</a></li>
                </ul>
            </div>
            </div>
            <div className="border-t border-secondary-border px-8 py-6">
            <p>© 2025 AdjusTimer. All rights reserved.</p>
            </div>
        </footer>
    )
}

export default Footer;