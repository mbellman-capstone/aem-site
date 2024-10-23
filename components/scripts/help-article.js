(function() {
	"use strict";

	// Best practice:
	// For a good separation of concerns, don't rely on the DOM structure or CSS selectors,
	// but use dedicated data attributes to identify all elements that the script needs to
	// interact with.
	var selectors = {
			self:      '[data-cmp-is="help-article"]'
	};

	function removeDirective(line) {
		return line.substring(line.indexOf(" ") + 1);
	}

	function replaceTags(text) {
		return text
			// Handle bold text
			.replace(/\[b\]/g, "<strong>")
			.replace(/\[\/b\]/g, "</strong>")
			// Handle links
			.replace(/\[url\=([\#A-Za-z0-9_]+)\]/g, function(_, match) {
				return `<a href="${match}">`;
			})
			.replace(/\[\/url\]/g, "</a>");
	}

	function formatImage(line) {
		var path = removeDirective(line);

		return `<div class="c-help-article__image"><img src=${path}></div>`;
	}

	function formatTitle(line) {
		var title = removeDirective(line);

		var headingId = title.toLowerCase()
			.replace(/\s/g, "_")
			.replace(/[^a-z0-9_]/g, "");

		return `<h2 id="${headingId}" class="c-help-article__title">${title}</h2>`;
	}

	function formatUnorderedListItem(line) {
		var text = line.substring(2);

		return `<li>${replaceTags(text)}</li>`;
	}

	function formatOrderedListItem(line) {
		var text = line.substring(line.indexOf(" ") + 1);

		return `<li>${replaceTags(text)}</li>`;
	}

	/**
	 * Converts raw content text into HTML.
	 *
	 * @param {string} content 
	 * @returns {string}
	 */
	function formatContent(content) {
		var lines = content.split("\n");
		var isGeneratingOrderedList = false;
		var isGeneratingUnorderedList = false;
		var generatedHtml = "";

		lines.forEach(function(line) {
			if (isGeneratingUnorderedList && !line.startsWith("*")) {
				// Terminate unordered lists
				generatedHtml += "</ul>";
				isGeneratingUnorderedList = false;
			}

			if (isGeneratingOrderedList && !/^[0-9*]./.test(line)) {
				// Terminated ordered lists
				generatedHtml += "</ol>";
				isGeneratingOrderedList = false;
			}

			if (line.startsWith("@image")) {
				// Handle image directives
				generatedHtml += formatImage(line);
			} else if (line.startsWith("@title")) {
				// Handle title directives
				generatedHtml += formatTitle(line);
			} else if (line.startsWith("*")) {
				// Handle unordered list items
				if (!isGeneratingUnorderedList) {
					generatedHtml += `<ul class="c-help-article__unordered-list">`;
				}

				generatedHtml += formatUnorderedListItem(line);

				isGeneratingUnorderedList = true;
			} else if (/^[0-9*]./.test(line)) {
				// Handle ordered list items
				if (!isGeneratingOrderedList) {
					generatedHtml += `<ol class="c-help-article__ordered-list">`;
				}

				generatedHtml += formatOrderedListItem(line);

				isGeneratingOrderedList = true;
			} else if (line.length > 0) {
				generatedHtml += `<div class="c-help-article__step">${replaceTags(line)}</div>`;
			}

			generatedHtml += "<br>";
		});

		return generatedHtml;
	}

	function onLinkClick(event) {
		var url = event.target.getAttribute("href");

		if (url.startsWith("#")) {
			// For intra-page links, find the target element and smoothly scroll to it
			var target = document.querySelector(url);

			if (target) {
				window.scrollTo({
					top: (target.getBoundingClientRect().top + window.scrollY) - 120,
					behavior: 'smooth'
				});

				event.preventDefault();
			}
		}
	}

	function HelpArticle(config) {

			function init(config) {
					var root = config.element;

					// Best practice:
					// To prevents multiple initialization, remove the main data attribute that
					// identified the component.
					root.removeAttribute("data-cmp-is");

					window.addEventListener("scroll", function() {
						var scrollTop = window.scrollY;
						var image = root.querySelector(".c-help-article__banner img");

						image.style.transform = `translateY(${scrollTop * 0.5}px)`;
					});

					// Format content
					var contentContainer = root.querySelector(".c-help-article__content");
					var content = contentContainer.getAttribute("data-content");

					contentContainer.innerHTML = formatContent(content);

					contentContainer.removeAttribute("data-content");

					// Handle link clicks
					contentContainer.querySelectorAll("a").forEach(function(link) {
						link.addEventListener("click", onLinkClick);
					});
			}

			if (config && config.element) {
					init(config);
			}
	}

	// Best practice:
	// Use a method like this mutation obeserver to also properly initialize the component
	// when an author drops it onto the page or modified it with the dialog.
	function onDocumentReady() {
			var elements = document.querySelectorAll(selectors.self);
			for (var i = 0; i < elements.length; i++) {
					new HelpArticle({ element: elements[i] });
			}

			var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
			var body             = document.querySelector("body");
			var observer         = new MutationObserver(function(mutations) {
					mutations.forEach(function(mutation) {
							// needed for IE
							var nodesArray = [].slice.call(mutation.addedNodes);
							if (nodesArray.length > 0) {
									nodesArray.forEach(function(addedNode) {
											if (addedNode.querySelectorAll) {
													var elementsArray = [].slice.call(addedNode.querySelectorAll(selectors.self));
													elementsArray.forEach(function(element) {
															new HelpArticle({ element: element });
													});
											}
									});
							}
					});
			});

			observer.observe(body, {
					subtree: true,
					childList: true,
					characterData: true
			});
	}

	if (document.readyState !== "loading") {
			onDocumentReady();
	} else {
			document.addEventListener("DOMContentLoaded", onDocumentReady);
	}

}());
