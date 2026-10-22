import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function TextLink({
	className,
	children,
	...props
}: ComponentProps<"a">) {
	return (
		<a {...props} className={cn("text-link", className)}>
			{children}
		</a>
	);
}
