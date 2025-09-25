import { ReactElement } from "react"
import logo from "../../public/extension_128.png"
import { Link } from "react-router-dom"
const Navigation =  (): ReactElement => {
    return (
        <nav className="w-full">
            <div className="flex justify-between max-w-5xl mx-auto">
                <div className="flex items-center">
                <a href="/"><img className="w-15" src={logo} /></a>
                <h2 className="ml-3 text-xl font-bold">AdjusTimer</h2>
                </div>
                <div className="flex lg:hidden">
                    <button
                    type="button"
                    className="text-gray-500 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 focus:outline-none focus:text-gray-600 dark:focus:text-gray-400"
                    aria-label="toggle menu"
                    >
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                        <path
                        fillRule="evenodd"
                        d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
                        ></path>
                    </svg>
                    </button>
                </div>
                <div className="hidden -mx-4 lg:flex lg:items-center">
                    <Link to="/"
                    className="block mx-4 mt-2 text-sm text-gray-700 capitalize lg:mt-0 dark:text-gray-200 hover:text-blue-600 dark:hover:text-indigo-400"
                    >ホーム</Link>
                    <a
                    href="https://www.fanbox.cc/@adjustimer/tags/%E3%82%A2%E3%83%83%E3%83%97%E3%83%87%E3%83%BC%E3%83%88%E6%83%85%E5%A0%B1"
                    target="_blank"
                    className="block mx-4 mt-2 text-sm text-gray-700 capitalize lg:mt-0 dark:text-gray-200 hover:text-blue-600 dark:hover:text-indigo-400"
                    >バージョン情報</a>
                    <Link to="/terms-of-use"
                    className="block mx-4 mt-2 text-sm text-gray-700 capitalize lg:mt-0 dark:text-gray-200 hover:text-blue-600 dark:hover:text-indigo-400"
                    >利用規約</Link>
                    <Link to="/privacy-policy"
                    className="block mx-4 mt-2 text-sm text-gray-700 capitalize lg:mt-0 dark:text-gray-200 hover:text-blue-600 dark:hover:text-indigo-400"
                    >プライバシーポリシー</Link>
                </div>
            </div>
        </nav>
    )
}
export default Navigation