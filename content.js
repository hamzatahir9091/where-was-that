const MARKERS = new Map()

function addPin() {
	if (document.getElementById("pinPopup")) return

	const pop = document.createElement("div")
	pop.id = "pinPopup"

	pop.innerHTML = `
			<input type="text" id="pinTitle" placeholder="Title (optional)" />
			<textarea id="pinNotes" placeholder="Notes (optional)"></textarea>
			<div style="display:flex;gap:10px;">
				<button id="submitPin">Add Pin</button>
				<button id="cancelPin">Cancel</button>
			</div>
		`

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
	})

	document.body.appendChild(pop)
	document.getElementById("pinTitle").focus()

	const cancelBtn = document.getElementById("cancelPin")
	cancelBtn.addEventListener("click", () => pop.remove())

	const submitBtn = document.getElementById("submitPin")
	submitBtn.addEventListener("click", savePin)

	document.addEventListener("keydown", function escHandler(e) {
		if (e.key === "Escape") {
			pop.remove()
			document.removeEventListener("keydown", escHandler)
		}
	})
}

function savePin() {
	const title = document.getElementById("pinTitle").value
	const notes = document.getElementById("pinNotes").value
	const scroll = window.scrollY

	const pin = {
		title,
		notes,
		scrollOffset: scroll,
	}

	// getting the url
	const url = window.location.href

	if (MARKERS.has(url)) {
		// if site has already pins
		MARKERS.get(url).push(pin)
	} else {
		MARKERS.set(url, [pin])
	}

	// Convert Map to plain object and save
	chrome.storage.local.set(Object.fromEntries(MARKERS), () => {
		console.log("Pins saved to Chrome storage!")
	})

	// close popup after saving
	document.getElementById("pinPopup")?.remove()
}

function loadPins() {
	if (document.getElementById("savedPins")) {
		document.getElementById("savedPins").remove
	}

	const url = window.location.href

	chrome.storage.local.get(null, (result) => {
		MARKERS.clear()
		for (const [url, pins] of Object.entries(result)) {
			MARKERS.set(url, pins)
		}

		const currentPins = MARKERS.get(url) || [] // return empty array if no pins

		let savedPins = document.createElement("div")
		savedPins.id = "savedPins"

		for (const [index, pin] of currentPins.entries()) {
			const pinDiv = document.createElement("div")
			pinDiv.className = "writtenTitle"
			pinDiv.textContent = pin.title || "(No Title)"

			// Add click listener to each pin div
			pinDiv.addEventListener("click", () => {
				// Scroll to saved position
				window.scrollTo({
					top: pin.scrollOffset,
					behavior: "smooth",
				})

				// Optionally, close the savedPins div
				document.getElementById("savedPins")?.remove()
			})

			savedPins.appendChild(pinDiv)
		}

		Object.assign(savedPins.style, {
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
		})

		document.body.appendChild(savedPins)
	})
}

document.addEventListener("keydown", (e) => {
	if (e.key === "S") addPin()
	if (e.key === "O") loadPins()
	if (e.key === "Escape") document.getElementById("pinPopup")?.remove()
})

function pinScroll() {}
