// src/types/custom-elements.d.ts
import type * as React from "react";

type MdBaseProps = React.DetailedHTMLProps<
	React.HTMLAttributes<HTMLElement>,
	HTMLElement
> & {
	// add the attributes you actually use
	type?: string;
	disabled?: boolean;
	value?: string;
	label?: string;
	checked?: boolean;
	selected?: boolean;
	
	// optional: allow any other attributes without TS errors
	[key: string]: any;
};

declare module "react" {
	namespace JSX {
		interface IntrinsicElements {
			[elemName: `md-${string}`]: MdBaseProps;
		}
	}
}

export {};
