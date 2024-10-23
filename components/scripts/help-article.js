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

	function formatTitle(line) {
		var title = removeDirective(line);

		var headingId = title.toLowerCase()
			.replace(/\s/g, "_")
			.replace(/[^a-z0-9_]/g, "");

		return `<h2 id="${headingId}" class="c-help-article__title">${title}</h2>`;
	}

	function formatImage(line) {
		var file = removeDirective(line);

		return `<div class="c-help-article__image"><img src=${file}></div>`;
	}

	function formatVideo(line) {
		var file = removeDirective(line);

		return `
			<button class="c-help-article__video-button" data-asset="${file}">
				<svg width="109" height="124" viewBox="0 0 109 124" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M0.46321 62.6254V107.432C0.368998 109.444 0.748793 111.45 1.57195 113.289C2.3951 115.128 3.63863 116.747 5.20235 118.018C9.7183 121.577 15.3008 123.513 21.0507 123.513C26.8006 123.513 32.383 121.577 36.899 118.018C42.6844 114.017 48.5313 110.079 54.3783 106.14C69.765 95.6765 85.1518 85.4592 100.477 74.8116C112.048 66.7489 111.248 55.6706 99.3076 47.9772C91.7373 43.0534 84.4133 37.8838 76.9661 32.8985C63.0565 23.4818 49.2084 14.0647 35.2372 4.70953C32.0635 2.62196 28.4429 1.31159 24.6683 0.883879C20.8938 0.456168 17.0714 0.923745 13.5111 2.24825C5.14075 5.14096 0.278602 10.2488 0.401696 17.8807C0.586337 32.9597 0.46321 47.7926 0.46321 62.6254Z" fill="black" fill-opacity="0.5"/>
				</svg>
			</button>
		`;
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
		var html = "";

		lines.forEach(function(line) {
			if (isGeneratingUnorderedList && !line.startsWith("*")) {
				// Terminate unordered lists
				html += "</ul>";
				isGeneratingUnorderedList = false;
			}

			if (isGeneratingOrderedList && !/^[0-9*]./.test(line)) {
				// Terminated ordered lists
				html += "</ol>";
				isGeneratingOrderedList = false;
			}

			if (line.startsWith("@image")) {
				// Handle image directives
				html += formatImage(line);
			} else if (line.startsWith("@title")) {
				// Handle title directives
				html += formatTitle(line);
			} else if (line.startsWith("@video")) {
				html += formatVideo(line);
			} else if (line.startsWith("*")) {
				// Handle unordered list items
				if (!isGeneratingUnorderedList) {
					html += `<ul class="c-help-article__unordered-list">`;
				}

				html += formatUnorderedListItem(line);

				isGeneratingUnorderedList = true;
			} else if (/^[0-9*]./.test(line)) {
				// Handle ordered list items
				if (!isGeneratingOrderedList) {
					html += `<ol class="c-help-article__ordered-list">`;
				}

				html += formatOrderedListItem(line);

				isGeneratingOrderedList = true;
			} else if (line.length > 0) {
				html += `<div class="c-help-article__step">${replaceTags(line)}</div>`;
			}

			html += "<br>";
		});

		return html;
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
