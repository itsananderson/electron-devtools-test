import * as React from 'react';
import { createRoot } from 'react-dom/client';

function Test(props: any) {
    return <h1>Nested Hello</h1>
}

function render() {
    const root = createRoot(document.getElementById("app"));
    root.render(<div><h2>Hello from React!</h2><Test /></div>);
}

render();
