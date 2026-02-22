const MARKERS = new Map()
let cachedScroller = null

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
				<button id="clearPin">Clear Pins</button>
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

	const clearBtn = document.getElementById("clearPin")
	clearBtn.addEventListener("click", () => {
		const url = window.location.href // get current site
		MARKERS.delete(url) // remove from in-memory map
		chrome.storage.local.remove(url, () => {
			console.log("Pins cleared for this site!")
		})

		// Optionally, remove the saved pins UI
		document.getElementById("savedPins")?.remove()
	})

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
	const tempScroller = getScroller()

	const scroll =
		tempScroller === window ? window.scrollY : tempScroller.scrollTop

	const pin = {
		title,
		notes,
		scrollOffset: scroll,
	}

	// getting the url
	const url = window.location.href

	if (MARKERS.has(url)) {
		// if site has already pins check which is the scroller element
		MARKERS.get(url).push(pin)
	} else {
		// if there are no prev pins
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
	const tempScroller = getScroller()

	if (document.getElementById("savedPins")) {
		document.getElementById("savedPins").remove()
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
				tempScroller.scrollTo({
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


function isScrollable(el) {
	const style = getComputedStyle(el)
	const hasScrollableContent = el.scrollHeight > el.clientHeight
	const hasOverflowY =
		style.overflowY === "auto" || style.overflowY === "scroll"

	return hasScrollableContent && hasOverflowY
}

function scrollerElement() {
	// comparing screen height

	const winHeight = window.innerHeight

	const body = document.body
	const fullHeight = body.scrollHeight

	if (fullHeight > winHeight + 50) return window

	const allElements = document.querySelectorAll("*")
	const scrollables = Array.from(allElements).filter(isScrollable)

	let maxWidth = 0
	let maxWelement = null

	// now we will check which scrollable element is main container
	for (const el of scrollables) {
		// const width = el.getBoundingClientRect().width
		const scrollArea = el.scrollHeight * el.scrollWidth

		if (scrollArea > maxWidth) {
			maxWidth = scrollArea
			maxWelement = el
		}
	}
	return maxWelement
}

function getScroller() {
	// If cachedScroller exists
	if (cachedScroller) {
		// If it's window, it's always valid
		if (cachedScroller === window) {
			return cachedScroller
		}

		// If it's an element, validate it
		if (document.contains(cachedScroller)) {
			return cachedScroller
		}
	}

	// Otherwise detect again
	cachedScroller = scrollerElement()
	return cachedScroller
}

document.addEventListener("keydown", (e) => {
	if (e.key === "S") addPin()
	if (e.key === "O") loadPins()
	if (e.key === "P") {
		const temp = scrollerElement()
		console.log("temp", temp)
		console.log("temp.scrollHeight", temp.scrollHeight)

		temp.scrollTo(0, 100)
	}

	if (e.key === "Escape") document.getElementById("pinPopup")?.remove()
})
