import "./assets/index.less";
import { h, render } from 'preact';

let root: any;
function init() {
	let HomePage = require('./components/HomePage').default;
	root = render(<HomePage />, document.body, root);
}

// HMR
if (module.hot) {
	require('preact/devtools');
	module.hot.accept('./components/HomePage', () => requestAnimationFrame(init));
}

document.addEventListener('DOMContentLoaded', init);
