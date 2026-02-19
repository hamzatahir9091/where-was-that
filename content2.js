(() => {
	const MARKERS = new Map(); // id -> marker element

	function addPin() {
		// Avoid multiple popups
		if (document.getElementById("pinPopup")) return;

		const pop = document.createElement("div");
		pop.id = "pinPopup";
		
		pop.innerHTML = `
			<input type="text" id="pinTitle" placeholder="Title (optional)" />
			<textarea id="pinNotes" placeholder="Notes (optional)"></textarea>
			<div style="display:flex;gap:10px;">
				<button id="submitPin">Add Pin</button>
				<button id="cancelPin">Cancel</button>
			</div>
		`;

		Object.assign(pop.style, {
			width: "250px",
			padding: "12px",
			background: "rgba(0,0,0,0.7)",
			backdropFilter: "blur(8px)",
			color: "white",
			position: "fixed",
			top: "20px",
			right: "20px",
			borderRadius: "8px",
			boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
			display: "flex",
			flexDirection: "column",
			gap: "8px",
			zIndex: 999999,
		});

		document.body.appendChild(pop);
		document.getElementById("pinTitle").focus();

		const cancelBtn = document.getElementById("cancelPin");
		cancelBtn.addEventListener("click", () => pop.remove());

		const submitBtn = document.getElementById("submitPin");
		submitBtn.addEventListener("click", savePin);

		document.addEventListener("keydown", function escHandler(e) {
			if (e.key === "Escape") {
				pop.remove();
				document.removeEventListener("keydown", escHandler);
			}
		});
	}

	// ---------------------------
	// Save Pin
	// ---------------------------
	function savePin() {
		const title = document.getElementById("pinTitle").value;
		const notes = document.getElementById("pinNotes").value;
		const scrollContainer = getScrollContainer();
		const anchor = getAnchorElement();
		if (!anchor) return alert("No valid element at center.");

		const containerRect = scrollContainer.getBoundingClientRect();
		const elementRect = anchor.getBoundingClientRect();
		const offset = scrollContainer.scrollTop - (elementRect.top - containerRect.top);

		const pin = {
			id: Date.now() + "_" + Math.random().toString(36).slice(2),
			selector: anchor.id ? "#" + anchor.id : null,
			textSnippet: anchor.innerText.slice(0, 80),
			domPath: getDomPath(anchor),
			offset,
			scrollY: scrollContainer.scrollTop,
			title,
			notes,
			createdAt: Date.now(),
		};

		const url = window.location.href;
		chrome.storage.local.get([url], function (result) {
			let pins = result[url] || [];
			pins.push(pin);
			chrome.storage.local.set({ [url]: pins }, () => {
				console.log("Pin saved:", pin);
				addMarker(pin);
			});
		});

		document.getElementById("pinPopup")?.remove();
	}

	// ---------------------------
	// Add Marker
	// ---------------------------
	function addMarker(pin) {
		if (MARKERS.has(pin.id)) return;

		const marker = document.createElement("div");
		Object.assign(marker.style, {
			position: "fixed",
			right: "20px",
			top: "0px",
			zIndex: 999999,
			cursor: "pointer",
			display: "flex",
			alignItems: "center",
			gap: "6px",
			transition: "top 0.2s",
		});

		const dot = document.createElement("span");
		Object.assign(dot.style, {
			width: "10px",
			height: "10px",
			backgroundColor: "limegreen",
			borderRadius: "50%",
			display: "inline-block",
		});

		const label = document.createElement("span");
		label.textContent = pin.title || "";
		Object.assign(label.style, {
			color: "white",
			fontSize: "12px",
			opacity: 0,
			transition: "opacity 0.2s",
			whiteSpace: "nowrap",
		});

		marker.appendChild(label);
		marker.appendChild(dot);
		document.body.appendChild(marker);

		marker.addEventListener("mouseenter", () => (label.style.opacity = 1));
		marker.addEventListener("mouseleave", () => (label.style.opacity = 0));
		marker.addEventListener("click", () => scrollToPin(pin));

		MARKERS.set(pin.id, { marker, pin });
		updateMarkerPosition(pin.id);
	}

	// ---------------------------
	// Update marker positions
	// ---------------------------
	function updateMarkers() {
		for (let id of MARKERS.keys()) updateMarkerPosition(id);
	}

	function updateMarkerPosition(id) {
		const entry = MARKERS.get(id);
		if (!entry) return;
		const { marker, pin } = entry;

		const scrollContainer = getScrollContainer();
		const el = resolveAnchor(pin);
		if (!el) return;

		const containerRect = scrollContainer.getBoundingClientRect();
		const elementRect = el.getBoundingClientRect();

		const top = elementRect.top - containerRect.top + scrollContainer.scrollTop + pin.offset;
		const percent = top / document.body.scrollHeight;
		marker.style.top = percent * window.innerHeight + "px";
	}

	// ---------------------------
	// Scroll to Pin
	// ---------------------------
	function scrollToPin(pin) {
		const scrollContainer = getScrollContainer();
		const el = resolveAnchor(pin);
		if (!el) return;

		const containerRect = scrollContainer.getBoundingClientRect();
		const elementRect = el.getBoundingClientRect();
		const target = elementRect.top - containerRect.top + scrollContainer.scrollTop + pin.offset;

		scrollContainer.scrollTo({ top: target, behavior: "smooth" });
	}

	// ---------------------------
	// Helpers
	// ---------------------------
	function getScrollContainer() {
		const els = document.querySelectorAll("*");
		for (let el of els) {
			const style = getComputedStyle(el);
			if ((style.overflowY === "auto" || style.overflowY === "scroll") && el.scrollHeight > el.clientHeight) return el;
		}
		return document.scrollingElement || document.documentElement;
	}

	function getAnchorElement() {
		let el = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
		if (!el) return null;
		while (el && el !== document.body) {
			const rect = el.getBoundingClientRect();
			if (rect.height > 30) return el;
			el = el.parentElement;
		}
		return document.body;
	}

	function getDomPath(el) {
		const path = [];
		while (el && el !== document.body) {
			const idx = Array.from(el.parentNode.children).indexOf(el);
			path.unshift(idx);
			el = el.parentNode;
		}
		return path;
	}

	function getElementFromPath(path) {
		let el = document.body;
		for (let idx of path) {
			if (!el.children[idx]) return null;
			el = el.children[idx];
		}
		return el;
	}

	function resolveAnchor(pin) {
		if (pin.selector) {
			const sel = document.querySelector(pin.selector);
			if (sel) return sel;
		}
		const all = document.querySelectorAll("*");
		for (let node of all) {
			if (node.innerText && node.innerText.startsWith(pin.textSnippet)) return node;
		}
		const el = getElementFromPath(pin.domPath);
		if (el) return el;
		return null;
	}

	// ---------------------------
	// Load pins
	// ---------------------------
	function loadPins() {
		const url = window.location.href;
		chrome.storage.local.get([url], function (result) {
			const pins = result[url] || [];
			pins.forEach(addMarker);
		});
	}

	// ---------------------------
	// Auto update positions on scroll/resize
	// ---------------------------
	window.addEventListener("scroll", updateMarkers);
	window.addEventListener("resize", updateMarkers);

	// ---------------------------
	// Keyboard shortcuts
	// ---------------------------
	document.addEventListener("keydown", (e) => {
		if (e.key === "O") addPin();
		if (e.key === "Escape") document.getElementById("pinPopup")?.remove();
	});

	loadPins();
})();
