const path = require("path");
const fs = require("fs");
const express = require("express");
const app = express();

/**
 * @param {string} htmlString
 * @param {string} tagName
 * @returns {string}
 */
function parseAndReplaceTags(htmlString, tagName) {
	const regExp = new RegExp(`<${tagName} name="(.*)" \/>`, "g");

	return htmlString.replace(regExp, (_, value) => {
		const fileContents = fs.readFileSync(path.join(__dirname, `/${tagName}s/`, `${value}.html`)).toString();

		// Recursively replace <component> tags
		return parseAndReplaceTags(fileContents, "component");
	});
}

app.get("/", (req, res) => {
	const indexContents = fs.readFileSync("./index.html").toString();
	const parsedIndexContents = parseAndReplaceTags(indexContents, "template");

	res
		.status(200)
		.contentType("text/html")
		.send(parsedIndexContents);
});

app.listen(1234, () => {
	console.log("Running: http://localhost:1234");

	if (process.platform === "win32") {
		require("child_process").exec("start http://localhost:1234");
	} else if (process.platform === "darwin") {
		require("child_process").exec("open http://localhost:1234");
	}
});