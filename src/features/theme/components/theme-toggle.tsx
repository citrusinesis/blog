import { Button } from "@/components/ui/button";

// Rendered as HTML by Astro; the head theme script handles clicks and persistence.
interface Props {
	label?: string;
	darkLabel?: string;
	lightLabel?: string;
}

export function ThemeToggle({
	label = "Theme",
	darkLabel = "Theme: dark mode, switch to light",
	lightLabel = "Theme: light mode, switch to dark",
}: Props) {
	return (
		<Button
			type="button"
			variant="link"
			className="h-auto cursor-pointer rounded-none border-0 px-0 py-1.5 text-[length:inherit] leading-[inherit] font-normal text-muted-foreground transition-none hover:text-ring hover:no-underline active:translate-y-0"
			data-theme-toggle=""
			data-theme-dark-label={darkLabel}
			data-theme-light-label={lightLabel}
			aria-label={label}
			title={label}
		>
			{label}
		</Button>
	);
}
