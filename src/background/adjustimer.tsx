import React from 'react';
import { createRoot } from 'react-dom/client';
import { AdjusTimerWindow } from './features/AdjusTimerWindow';

createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <AdjusTimerWindow />
    </React.StrictMode>
);
