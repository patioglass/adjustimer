/// <reference types="vite/client" />
/// <reference types="chrome" />
declare interface Window {
    documentPictureInPicture?: DocumentPictureInPicture;
  }
  
  type DocumentPictureInPicture = {
    requestWindow: (options?: {
      disallowReturnToOpener?: boolean;
      preferInitialWindowPlacement?: boolean;
      width?: number;
      height?: number;
    }) => Promise<Window>;
  };