import styles from './styles.module.css';
import { Fragment, memo, useCallback, useMemo, useRef, useState } from 'react';
import { getInterpolatedColor, useWindowLoadedEffect } from './utils';
import { useMousePosition } from './contexts/mouse-position-context';
import { useGridInfo } from './contexts/grid-info-context';
import config from './config';

const { squareSize, squareBorderRadius, outlineWidth, circleSize } = config;

export const GlassLandingContent = memo(function() {
	const gridInfo = useGridInfo();
	return(
		<div
			className={styles.root}
			style={{
				['--square-size' as string]: `${squareSize}px`,
				['--square-border-radius' as string]: `${squareBorderRadius}px`,
				['--outline-width' as string]: `${outlineWidth}px`,
				['--square-count-x' as string]: `${gridInfo.squareCountX}`,
				['--square-count-y' as string]: `${gridInfo.squareCountY}`,
			}}
		>
			{
				gridInfo.isMobile ? (
					<MobileContent />
				) : (
					<Circle />
				)
			}

			<div className={styles.glass_square_grid}>
				{
					Array.from({ length: gridInfo.squareCount }).map(function(_, index) {
						const anchorInsetSquares = 1;
						const topTextAnchorIndex = gridInfo.squareCountX + anchorInsetSquares;
						const bottomTextAnchorIndex = gridInfo.squareCount - gridInfo.squareCountX - anchorInsetSquares;

						if (index === topTextAnchorIndex && !gridInfo.isMobile) {
							return(
								<Fragment key={`gridKey-${index}`}>
									<TopSection />
									<GlassSquare />
								</Fragment>
							)
						}

						if (index === bottomTextAnchorIndex && !gridInfo.isMobile) {
							return(
								<Fragment key={`gridKey-${index}`}>
									<BottomSection />
									<GlassSquare />
								</Fragment>
							)
						}

						return(
							<GlassSquare key={`gridKey-${index}`} />
						);
					})
				}
			</div>
		</div>
	)
})

function MobileContent() {
	return(
		<div className={styles.mobile_content_container}>
			<TopSection />
			<BottomSection />
		</div>
	)
}

const NavRightCurve = memo(function() {
	return (
		<div className={styles.nav_right_curve}>
			<div className={styles.right_curve_a} />
			<div className={styles.right_curve_b} />
		</div>
	)
})

const NavLeftCurve = memo(function() {
	return (
		<div className={styles.nav_left_curve}>
			<div className={styles.left_curve_a} />
			<div className={styles.left_curve_b} />
		</div>
	)
})

const BottomSection = memo(function() {
	const handleResumeClick = useCallback(function() {
		window.open('./resume.pdf', '_blank')
	}, []);

	const handleGithubClick = useCallback(function() {
		window.open('https://github.com/bogdanblazhkevych/', '_blank')
	}, []);

	return (
		<div className={styles.bottom_section_anchor}>
			<div className={styles.bottom_section_container}>
				<div className={styles.bottom_section_layout}>
					<div className={styles.bottom_text_wrapper}>
						<span>
							Full stack engineer turning complex problems into scalable web apps. Focused on simplicity. Lets talk.
						</span>
					</div>

					<div className={styles.base_nav_item} onClick={handleResumeClick}>
						Resume
						<NavLeftCurve />
					</div>

					<div className={styles.base_nav_item} onClick={handleGithubClick}>
						Github
						<NavRightCurve />
					</div>
				</div>
			</div>
		</div>
	)
})

const TopSection = memo(function() {
	return (
		<div className={styles.top_section_anchor} >
			<div className={styles.top_text_wrapper}>
				<span>
					Bogdan Blazhkevych
				</span>
			</div>
			<div className={styles.top_text_wrapper}>
				<span>
					Software Dev
				</span>
			</div>
			<div className={styles.top_text_wrapper}>
				<span>
					New York
				</span>
			</div>
		</div>
	)
})

const circleSizeThird = Math.floor(circleSize / 3);
const circleSizeTwoThirds = circleSizeThird * 2;
const circleSizeSixth = Math.floor(circleSize / 6);

const GlassSquare = memo(function() {
	const { viewportWidth, viewportHeight } = useGridInfo();
	const { mousePosition } = useMousePosition();
	const [squareRect, setSquareRect] = useState<DOMRect | null>(null);
	const glassSquareRef = useRef<HTMLDivElement | null>(null);

	const backgroundImage = useMemo(function() {
		if (!squareRect) {
			return ('none');
		}

		const visibleBlurRadius = circleSize + circleSizeThird;
		const visibleBlurRadiusSquared = Math.pow(visibleBlurRadius, 2);

		const offsetX = (mousePosition.x - squareRect.x - circleSizeSixth);
		const offsetY = (mousePosition.y - squareRect.y - circleSizeSixth);
		const mouseOffsetSquared = Math.pow(offsetX, 2) + Math.pow(offsetY, 2);

		// gradient will be transparent here, so return early to help optimize
		if (mouseOffsetSquared > visibleBlurRadiusSquared) {
			return('none');
		}

		const rgb = getInterpolatedColor((mousePosition.x / window.innerWidth), (mousePosition.y / window.innerHeight));

		return(`
			radial-gradient(
				circle
				at ${offsetX}px ${offsetY}px,
				rgb(${rgb.r}, ${rgb.g}, ${rgb.b}),
				rgba(${rgb.r - 100}, ${rgb.g - 100}, ${rgb.b - 100}, 0%) ${circleSizeTwoThirds}px
			),
			radial-gradient(
				circle
				at ${offsetX + circleSizeSixth}px ${offsetY + circleSizeSixth}px,
				rgb(${rgb.r - 100}, ${rgb.g - 100}, ${rgb.b - 100}) ${circleSizeThird}px,
				transparent ${circleSize}px
			)`
		)
	}, [mousePosition, squareRect]);

	useWindowLoadedEffect(function() {
		if (!glassSquareRef.current) {
			return
		}

		const rect = glassSquareRef.current.getBoundingClientRect();
		setSquareRect(rect);
	}, [viewportWidth, viewportHeight]);

	return(
		<div className={styles.glass_square_container} ref={glassSquareRef}>
			<GlassSquareBlur backgroundImage={backgroundImage} />
		</div>
	);
})

const GlassSquareBlur = memo(function({ backgroundImage }: { backgroundImage: string }) {
	return(
		<div className={styles.glass_square_blur_root} style={{ backgroundImage: backgroundImage }}>
			<div className={styles.glass_square_blur_center_right} />

			<div className={styles.glass_square_blur_top_right} />

			<div className={styles.glass_square_blur_top_center} />

			<div className={styles.glass_square_blur_top_left} />

			<div className={styles.glass_square_blur_center_left} />

			<div className={styles.glass_square_blur_bottom_left} />

			<div className={styles.glass_square_blur_bottom_center} />

			<div className={styles.glass_square_blur_bottom_right} />
		</div>
	)
})

function Circle() {
	const { mousePosition } = useMousePosition();
	const [loaded, setLoaded] = useState(false);

	useWindowLoadedEffect(function() {
		setLoaded(true);
	}, []);

	const circleStyles: React.CSSProperties = useMemo(function() {
		const rgb = getInterpolatedColor((mousePosition.x / window.innerWidth), (mousePosition.y / window.innerHeight));
		const mainColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
		const darkAccent = `rgb(0, 0, 0)`;

		return({
			transform: `translate(calc(-50% + ${mousePosition.x}px), calc(-50% + ${mousePosition.y}px))`,
			background: `radial-gradient(circle at 100px 100px, ${mainColor}, ${darkAccent})`,
			width: `${circleSize}px`,
			height: `${circleSize}px`,
			borderRadius: '50%',
			position: 'absolute'
		});
	}, [mousePosition]);

	if (loaded) {
		return(
			<div style={circleStyles} />
		)
	}
}
