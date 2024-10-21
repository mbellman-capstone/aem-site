(function() {
	"use strict";

	// Best practice:
	// For a good separation of concerns, don't rely on the DOM structure or CSS selectors,
	// but use dedicated data attributes to identify all elements that the script needs to
	// interact with.
	var selectors = {
			self:      '[data-cmp-is="home-banner"]'
	};

	function HomeBanner(config) {

			function init(config) {
					var root = config.element;

					// Best practice:
					// To prevents multiple initialization, remove the main data attribute that
					// identified the component.
					root.removeAttribute("data-cmp-is");

					window.addEventListener("scroll", function() {
						var scrollTop = window.scrollY;
						var image = root.querySelector('.c-home-banner__background img');
						var moon = root.querySelector('.c-home-banner__moon');
						var rocketShip = root.querySelector('.c-home-banner__rocket-ship');
			
						image.style.transform = `translateY(${scrollTop * 0.8}px)`;
						moon.style.transform = `translateY(${scrollTop * 0.3}px)`;
						rocketShip.style.transform = `translate(${-scrollTop * 0.15}px, ${-scrollTop * 0.3}px)`;
			
						if (scrollTop > 100) {
							rocketShip.classList.add('flying');
						} else {
							rocketShip.classList.remove('flying');
						}
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
					new HomeBanner({ element: elements[i] });
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
															new HomeBanner({ element: element });
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
