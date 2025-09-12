import { StrictMode } from 'react'
import { Root, createRoot } from 'react-dom/client'
import VideoInfo from './features/VideoInfo'

// reactのルートとなる要素を作成
const rootEl: HTMLElement = document.createElement('div')
document.body.insertBefore(rootEl, document.body.firstElementChild)

const root: Root = createRoot(rootEl)
root.render(
  <StrictMode>
    <VideoInfo />
  </StrictMode>
)