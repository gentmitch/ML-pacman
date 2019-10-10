export function longpress(node, threshold = 200) {
	const handle_mousedown = () => {
		let start = Date.now();
		
		const timeout = setInterval(() => {
			node.dispatchEvent(new CustomEvent('longpress'));
		}, threshold);
		
		const cancel = () => {
			clearInterval(timeout);
			node.removeEventListener('mouseup', cancel);
		};
		
		node.addEventListener('mouseup', cancel);
	}
	
	node.addEventListener('mousedown', handle_mousedown);
	
	return {
		destroy() {
			node.removeEventListener('mousedown', handle_mousedown);
		}
	};
}