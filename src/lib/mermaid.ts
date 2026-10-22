import { defineMdastPlugin } from "satteri";

const escapeHtml = (text: string) =>
	text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

// Rewrites ```mermaid fences into a bare <pre> that the client-side pele renderer picks up.
// Doing it on the mdast keeps Expressive Code, which highlights `pre > code` during the hast pass, from ever seeing these fences.
// A <pre> rather than a <div> because CommonMark ends a <div> HTML block at the first blank line, which Mermaid sources may contain.
export const mermaid = defineMdastPlugin({
	name: "mermaid",
	code(node, ctx) {
		if (node.lang !== "mermaid") {
			return;
		}
		ctx.replaceNode(node, {
			raw: `<pre class="pele-diagram not-prose">${escapeHtml(node.value)}</pre>`,
			mdxExpressions: false,
		});
	},
});
