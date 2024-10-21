(function() {
	"use strict";

	// Best practice:
	// For a good separation of concerns, don't rely on the DOM structure or CSS selectors,
	// but use dedicated data attributes to identify all elements that the script needs to
	// interact with.
	var selectors = {
			self:      '[data-cmp-is="home-summary"]'
	};

	function HomeSummary(config) {

			function init(config) {
					var root = config.element;

					// Best practice:
					// To prevents multiple initialization, remove the main data attribute that
					// identified the component.
					root.removeAttribute("data-cmp-is");

					window.addEventListener("scroll", function() {
						var animal = root.querySelector('.c-home-summary__animal');
						var bounds = animal.getBoundingClientRect();
						var pageCenter = window.innerHeight / 2;
						var centerOffset = pageCenter - (bounds.top + bounds.height / 2);
			
						animal.style.transform = `translateY(${-centerOffset * 0.05}px)`;
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
					new HomeSummary({ element: elements[i] });
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
															new HomeSummary({ element: element });
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
