const fs = require("fs");

fs.mkdirSync("aem-dist");
fs.mkdirSync("aem-dist/components");
fs.mkdirSync("aem-dist/clientlibs");

const markupFiles = fs.readdirSync("components/markup");
const styleFiles = fs.readdirSync("components/styles");
const scriptFiles = fs.readdirSync("components/scripts");

for (const filename of markupFiles) {
	const componentName = filename.replace(".html", "");

	fs.mkdirSync(`aem-dist/components/${componentName}`);
	fs.mkdirSync(`aem-dist/components/${componentName}/_cq_dialog`);

	fs.copyFileSync(`components/markup/${filename}`, `aem-dist/components/${componentName}/${filename}`);
}

for (const filename of styleFiles) {
	fs.copyFileSync(`components/styles/${filename}`, `aem-dist/clientlibs/_${filename.replace(".css", ".scss")}`)
}

for (const filename of scriptFiles) {
	fs.copyFileSync(`components/scripts/${filename}`, `aem-dist/clientlibs/_${filename}`);
}