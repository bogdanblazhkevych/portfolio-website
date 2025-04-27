import { createContext, memo, useState, useMemo, useContext, useEffect, PropsWithChildren } from "react";
import config from "../config";

interface IGridInfo {
	isMobile: boolean;
	viewportWidth: number;
	viewportHeight: number;
	squareCountX: number;
	squareCountY: number;
	squareCount: number;
}

const GridInfoContext = createContext<IGridInfo | undefined>(undefined);

const { squareSize } = config;

function getGridInfo(): IGridInfo {
	const viewportWidth = document.documentElement.clientWidth; 
	const viewportHeight = document.documentElement.clientHeight;
	const isMobile = viewportWidth <= 700;

	const squareCountX = Math.ceil(viewportWidth / squareSize);
	const squareCountY = Math.ceil(viewportHeight / squareSize);
	const squareCount = squareCountX * squareCountY;

	return({ isMobile, viewportWidth, viewportHeight, squareCountX, squareCountY, squareCount });
}

export const GridInfoProvider = memo(function({ children }: PropsWithChildren) {
	const [gridInfo, setGridInfo] = useState<IGridInfo>(getGridInfo);

	useEffect(function() {
		function handleResize() {
			setGridInfo(getGridInfo());
		}

		window.addEventListener('resize', handleResize);

		return function() {
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	const value = useMemo(function() {
		return(gridInfo);
	}, [gridInfo]);

	return (
		<GridInfoContext.Provider value={value}>
			{children}
		</GridInfoContext.Provider>
	);
});

export function useGridInfo() {
	const context = useContext(GridInfoContext);
	if (!context) {
		throw new Error('useGridInfo must be used within a GridInfoProvider');
	}

	return(context);
}
