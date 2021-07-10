import "./assets/styles.less";
import { h, render } from 'preact';

let root: any;
function init() {
	let App = require('./HomePage').default;
	root = render(<App />, document.body, root);
}

// HMR
if (module.hot) {
	require('preact/devtools');
	module.hot.accept('./HomePage', () => requestAnimationFrame(init));
}

document.addEventListener('DOMContentLoaded', init);
