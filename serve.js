const path = require("path");
const fs = require("fs");
const express = require("express");
const app = express();

function transformDataArrayElement(element) {
	if (element.type === "link") {
		return `<li><a href="${element.url}">${element.text}</a></li>`;
	}

	return "";
}

app.get("/*", (req, res, next) => {
	if (req.path.includes(".") || req.path.includes("%7B") || req.path.includes("%7D")) {
		return next();
	}

	const pagename = req.path.split("/")[1];
	const pagefile = `./pages/${pagename || "landing"}.json`;

	delete require.cache[require.resolve(pagefile)];

	const { template, data = {}, components } = require(pagefile);

	// Generate markup for all components (content)
	const contentMarkup = components.map(({ component, ...options }) => {
		let componentMarkup = fs
			.readFileSync(`./components/markup/${component}.html`)
			.toString();

		for (const key in options) {
			const value = options[key];

			componentMarkup = componentMarkup.replace(new RegExp(`\\\${properties.${key}}`, "g"), value);
		}

		return componentMarkup;
	}).join("");

	let templateMarkup = fs
		.readFileSync(`./templates/markup/${template}.html`)
		.toString()
		.replace("{{content}}", contentMarkup);

	// Interpolate template data values
	for (const key in data) {
		let value = data[key];

		if (Array.isArray(value)) {
			value = value.map(transformDataArrayElement).join("");
		}

		templateMarkup = templateMarkup.replace(new RegExp(`{{${key}}}`, "g"), value);
	}

	// Inject template markup into index
	const indexContents = fs
		.readFileSync("./index.html")
		.toString()
		.replace("{{template}}", templateMarkup)

	res
		.status(200)
		.contentType("text/html")
		.send(indexContents);
});

app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, req.url));
});

app.listen(1234, () => {
	console.log("Running: http://localhost:1234");

	if (process.platform === "win32") {
		require("child_process").exec("start http://localhost:1234");
	} else if (process.platform === "darwin") {
		require("child_process").exec("open http://localhost:1234");
	}
});