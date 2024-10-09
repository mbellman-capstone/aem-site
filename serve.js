const path = require("path");
const fs = require("fs");
const express = require("express");
const app = express();

app.get("/*", (req, res, next) => {
	if (req.path.includes(".")) {
		return next();
	}

	const pagename = req.path.split("/")[1];
	const pagefile = `./pages/${pagename || "landing"}.json`;

	delete require.cache[require.resolve(pagefile)];

	const { template, components } = require(pagefile);

	const contentMarkup = components.map(({ component, ...options }) => {
		let componentMarkup = fs
			.readFileSync(`./components/${component}/component.html`)
			.toString();

		for (const key in options) {
			const value = options[key];

			componentMarkup = componentMarkup.replace(new RegExp(`{{${key}}}`, "g"), value);
		}

		return componentMarkup;
	}).join("");

	const templateMarkup = fs
		.readFileSync(`./templates/${template}/template.html`)
		.toString()
		.replace("{{content}}", contentMarkup);

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