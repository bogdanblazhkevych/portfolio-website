import { DependencyList, useEffect } from "react";
import { Point, Size, RGBArr } from "./types";

const baseColorTopLeft: RGBArr = [52, 211, 153];
const baseColorTopRight: RGBArr = [255, 180, 162];
const baseColorBottomRight: RGBArr = [255, 61, 111];
const baseColorBottomLeft: RGBArr = [166, 124, 254];

function interpolateColor(color1: RGBArr, color2: RGBArr, alpha: number): RGBArr {
	return([
		color1[0] + (color2[0] - color1[0]) * alpha,
		color1[1] + (color2[1] - color1[1]) * alpha,
		color1[2] + (color2[2] - color1[2]) * alpha
	]);
}

export function getInterpolatedColor(x: number, y: number) {
	const interpolatedColorTop = interpolateColor(baseColorTopLeft, baseColorTopRight, x);
	const interpolatedColorBottom = interpolateColor(baseColorBottomLeft, baseColorBottomRight, x);
	const interpolatedColor = interpolateColor(interpolatedColorTop, interpolatedColorBottom, y);

	const [r, g, b] = interpolatedColor.map(function(channelValue) {
		return(Math.round(channelValue));
	}) as RGBArr;

	return({ r, g, b });
}

interface IAnimateDvdBounce {
	callback?: (position: Point) => void;
	objectSize?: Size;
	velocity?: Point;
	bounds?: Size;
	initialPosition?: Point;
}

export function animateDvdBounce(args: IAnimateDvdBounce) {
	const {
		callback,
		objectSize = { width: 100, height: 100 },
		velocity = { x: 1, y: 1 },
		bounds = { width: window.innerWidth, height: window.innerHeight },
		initialPosition = { x: 0, y: 0 }
	} = args

	let mousePosition: Point = initialPosition;
	let vx = velocity.x;
	let vy = velocity.y;
	let animationFrameId: number;

	function update() {
		mousePosition.x += vx;
		mousePosition.y += vy;

		if (mousePosition.x <= 0 || mousePosition.x + objectSize.width >= bounds.width) {
			vx = -vx;
			mousePosition.x = Math.max(0, Math.min(mousePosition.x, bounds.width - objectSize.width));
		}

		if (mousePosition.y <= 0 || mousePosition.y + objectSize.height >= bounds.height) {
			vy = -vy;
			mousePosition.y = Math.max(0, Math.min(mousePosition.y, bounds.height - objectSize.height));
		}

		if (callback) {
			callback({ ...mousePosition });
		}

		animationFrameId = requestAnimationFrame(update);
	}

	return({
		cancel: function() {
			cancelAnimationFrame(animationFrameId)
		},
		start: function() {
			update();
		}
	})
}

// Usefull for dealing with bugs that occur due to react lifecycle
// For example, in some cases getBoundingClientRect of an element when readyState === 'interactive' will have different values when readyState === 'complete'
export function useWindowLoadedEffect(cb: () => void, deps: DependencyList) {
	useEffect(function() {
		const scopedCallback = function() {
			cb();
		}

		if (document.readyState === 'complete') {
			scopedCallback();
		} else {
			window.addEventListener('load', scopedCallback);
			return function() {
				window.removeEventListener('load', scopedCallback);
			}
		}
	}, deps);
}
