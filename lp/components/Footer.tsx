import { ReactElement } from "react";
import { Link } from "react-router-dom";

const Footer = (): ReactElement => {
    return (
        <footer className="bg-gray-800 text-center mx-auto text-white">
            <div className="py-10 grid md:grid-cols-3 gap-8 px-8 max-w-6xl mx-auto">
            <div className="p-6 text-left">
                <h2 className="text-lg font-bold mb-3">AdjusTimerについて</h2>
                <ul className="text-sm/8">
                    <li><Link to="/terms-of-use">利用規約</Link></li>
                    <li><Link to="/privacy-policy">プライバシーポリシー</Link></li>
                </ul>
            </div>
            <div className="p-6 text-left">
                <h2 className="text-lg font-bold mb-3">その他</h2>
                <ul className="text-sm/8">
                <li><a href="https://www.fanbox.cc/@adjustimer/tags/%E3%82%A2%E3%83%83%E3%83%97%E3%83%87%E3%83%BC%E3%83%88%E6%83%85%E5%A0%B1" target="_blank">アップデート情報</a></li>
                </ul>
            </div>
            <div className="p-6 text-left">
                <h2 className="text-lg font-bold mb-3">連絡先</h2>
                <ul className="text-sm/8">
                <li><a href="https://x.com/adjustimer" target="_blank">Twitter(X) @adjustimer</a></li>
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