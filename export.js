const fs = require("fs");
const path = require("path");

const TARGET_REPO = "PEBBLEGO-p138935-uk63540";

const targetComponentsPath = path.join(__dirname, "..", TARGET_REPO, "ui.apps/src/main/content/jcr_root/apps/pebblegodev/components");
const targetAssetsPath = path.join(__dirname, "..", TARGET_REPO, "ui.frontend/src/main/webpack/components");
const componentFolders = fs.readdirSync("aem-build/components");
const componentAssets = fs.readdirSync("aem-build/clientlibs");

for (const folder of componentFolders) {
	fs.cpSync(`aem-build/components/${folder}`, `${targetComponentsPath}/${folder}`, {
		recursive: true
	});
}

for (const asset of componentAssets) {
	fs.cpSync(`aem-build/clientlibs/${asset}`, `${targetAssetsPath}/${asset}`);
}