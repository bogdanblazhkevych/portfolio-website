import { createContext, memo, useState, useMemo, useContext, useEffect, PropsWithChildren } from "react";
import { animateDvdBounce } from "../utils";
import { Point } from "../types";
import { useGridInfo } from "./grid-info-context";

interface IMousePositionContext {
	mousePosition: Point;
}

const MousePositionContext = createContext<IMousePositionContext | undefined>(undefined);

const initialMousePosition = {
	x: (document.documentElement.clientWidth / 2),
	y: (document.documentElement.clientHeight / 2)
}

export const MousePositionProvider = memo(function({ children }: PropsWithChildren) {
	const { isMobile } = useGridInfo();
	const [mousePosition, setMousePosition] = useState<Point>(initialMousePosition);

	useEffect(function () {
		if (isMobile) {
			const { cancel, start } = animateDvdBounce({
				callback: setMousePosition,
				initialPosition: mousePosition
			});

			start();

			return function() {
				cancel();
			}
		} else {
			function onMouseMove(event: MouseEvent) {
				setMousePosition({
					x: event.clientX,
					y: event.clientY
				})
			}

			window.addEventListener('mousemove', onMouseMove);

			return function() {
				window.removeEventListener('mousemove', onMouseMove);
			};
		}
	}, [isMobile]);

	const value = useMemo(function() {
		return({ mousePosition });
	}, [mousePosition]);

	return (
		<MousePositionContext.Provider value={value}>
			{ children }
		</MousePositionContext.Provider>
	);
});

export const useMousePosition = () => {
	const context = useContext(MousePositionContext);
	if (!context) {
		throw new Error('useMousePosition must be used within a MousePositionProvider');
	}

	return(context);
};
