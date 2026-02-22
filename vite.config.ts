import { defineConfig } from "vite";
import userscript from "vite-userscript-plugin";
import packageJson from "./package.json" with { type: "json" };

export default defineConfig({
	plugins: [
		userscript({
			entry: "src/yno-translate.user.ts",
			fileName: "yno-translate",
			header: {
				name: "Yno Translate",
				match: "https://ynoproject.net/*/",
				version: packageJson.version,
				description: "Dream internationally!",
				grant: ["GM_xmlhttpRequest", "GM_setValue", "GM_getValue", "GM_log"],
				"run-at": "document-end",
				connect: "translate.googleapis.com",
			},
			esbuildTransformOptions: {
				minify: false,
				treeShaking: true,
			},
			server: {
				port: 3000
			}
		}),
	],
});
