import { GlassLandingContent } from "./content";
import { GridInfoProvider } from "./contexts/grid-info-context";
import { MousePositionProvider } from "./contexts/mouse-position-context";

export default function GlassLandingPage() {
	return (
		<GridInfoProvider>
			<MousePositionProvider>
				<GlassLandingContent />
			</MousePositionProvider>
		</GridInfoProvider>
	);
}
