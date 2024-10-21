const fs = require("fs");

//
// Create target directories
//
fs.mkdirSync("aem-build");
fs.mkdirSync("aem-build/components");
fs.mkdirSync("aem-build/clientlibs");

const markupFiles = fs.readdirSync("components/markup");
const styleFiles = fs.readdirSync("components/styles");
const scriptFiles = fs.readdirSync("components/scripts");

//
// Build component HTML/registration files
//
for (const filename of markupFiles) {
	const componentName = filename.replace(".html", "");

	const componentDisplayName = componentName
		.split("-")
		.map(part => part[0].toUpperCase() + part.slice(1))
		.join(" ");

	const contentXml = `<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:cq="http://www.day.com/jcr/cq/1.0" xmlns:jcr="http://www.jcp.org/jcr/1.0"
    jcr:primaryType="cq:Component"
    jcr:title="${componentDisplayName} Component"
    componentGroup="pebblegodev - Content"/>`;

	fs.mkdirSync(`aem-build/components/${componentName}`);
	fs.mkdirSync(`aem-build/components/${componentName}/_cq_dialog`);

	fs.copyFileSync(`components/markup/${filename}`, `aem-build/components/${componentName}/${filename}`);
	fs.writeFileSync(`aem-build/components/${componentName}/.content.xml`, contentXml);
}

//
// Auto-generate component editor dialog XML files
//
const pageFiles = fs.readdirSync("pages");
const uniqueComponentExamples = [];

for (const file of pageFiles) {
	const { components } = require(`./pages/${file}`);

	for (const componentData of components) {
		if (!uniqueComponentExamples.find(example => example.component === componentData.component)) {
			uniqueComponentExamples.push(componentData);
		}
	}
}

//
// Using each unique component example, build the dialog XML structure
//
for (const { component: componentName, ...properties } of uniqueComponentExamples) {
	const targetFilename = `aem-build/components/${componentName}/_cq_dialog/.content.xml`;

	// Build the lineup of editor fields using the example properties
	const editableFieldsContentXml = Object.keys(properties)
		.map(key => {
			const value = properties[key];
			const isImage = /.(png|jpg|jpeg|svg)$/.test(value);

			// Fudge the property name into an appropriate display format.
			// E.g. "backgroundImage" -> "Background image"
			const fieldLabel = key
				// Split the key at capital letters, preserving the letter in the array
				.split(/([A-Z])/g)
				// Convert capital letters into lowercase preceded by a space
				.map(part => /[A-Z]/.test(part[0]) ? ` ${part.toLowerCase()}` : part)
				.join("");

			// Capitalize the first letter of the label
			const finalFieldLabel = fieldLabel[0].toUpperCase() + fieldLabel.slice(1);

			// For images, use the "pathbrowser" resource. Otherwise use "textfield" or "textarea" depending on length.
			// Awkward spacing here is necessary to preserve tidy output indentation.
			if (isImage) {
				return `                    <${key}
                        jcr:primaryType="nt:unstructured"
                        sling:resourceType="granite/ui/components/foundation/form/pathbrowser"
                        fieldLabel="${finalFieldLabel}"
                        name="./${key}"/>`;
			} else if (value.length > 100) {
				return `                    <${key}
                        jcr:primaryType="nt:unstructured"
                        sling:resourceType="granite/ui/components/coral/foundation/form/textarea"
                        emptyText="${finalFieldLabel}"
                        name="./${key}"/>`;
			} else {
				return `                    <${key}
                        jcr:primaryType="nt:unstructured"
                        sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
                        fieldLabel="${finalFieldLabel}"
                        name="./${key}"/>`;
			}

		})
		.join("\n");

	const dialogContentXml = `<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:sling="http://sling.apache.org/jcr/sling/1.0" xmlns:cq="http://www.day.com/jcr/cq/1.0" xmlns:jcr="http://www.jcp.org/jcr/1.0" xmlns:nt="http://www.jcp.org/jcr/nt/1.0"
    jcr:primaryType="nt:unstructured"
    jcr:title="Properties"
    sling:resourceType="cq/gui/components/authoring/dialog">
    <content
        jcr:primaryType="nt:unstructured"
        sling:resourceType="granite/ui/components/coral/foundation/fixedcolumns">
        <items jcr:primaryType="nt:unstructured">
            <column
                jcr:primaryType="nt:unstructured"
                sling:resourceType="granite/ui/components/coral/foundation/container">
                <items jcr:primaryType="nt:unstructured">
${editableFieldsContentXml}
                </items>
            </column>
        </items>
    </content>
</jcr:root>`;

	fs.writeFileSync(targetFilename, dialogContentXml);
}

//
// Add stylesheets
//
for (const filename of styleFiles) {
	fs.copyFileSync(`components/styles/${filename}`, `aem-build/clientlibs/_${filename.replace(".css", ".scss")}`)
}

//
// Add scripts
//
for (const filename of scriptFiles) {
	fs.copyFileSync(`components/scripts/${filename}`, `aem-build/clientlibs/${filename}`);
}