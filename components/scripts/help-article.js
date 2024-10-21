(function() {
	"use strict";

	// Best practice:
	// For a good separation of concerns, don't rely on the DOM structure or CSS selectors,
	// but use dedicated data attributes to identify all elements that the script needs to
	// interact with.
	var selectors = {
			self:      '[data-cmp-is="help-article"]'
	};

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
					var contentContainer = document.querySelector(".c-help-article__content");
					var content = contentContainer.getAttribute("data-content");

					var formattedContent = content
						.split("\n")
						.map(function(line) {
							if (line.startsWith("@image")) {
								var path = line.split(" ").pop();

								return `<div class="c-help-article__image"><img src=${path}></div>`;
							} else if (line.length > 0) {
								return `<div class="c-help-article__step">${line}</div>`;
							} else {
								return "";
							}
						})
						.join("<br>");

					contentContainer.innerHTML = formattedContent;
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
