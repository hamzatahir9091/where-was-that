const MARKERS = new Map()
let cachedScroller = null

function addPin() {
	if (document.getElementById("pinPopup")) return
	if (document.getElementById("savedPins")) {
		document.getElementById("savedPins").remove()
	}

	const pop = document.createElement("div")
	pop.id = "pinPopup"

	pop.innerHTML = `
    <div class="pop">
        <form class="forme">
            <p class="heading">Pin Adder</p>
            <div class="inputs">
                <input placeholder="Title" class="input" type="text" id="pinTitle">
                <input placeholder="Notes" class="input" type="text" id="pinNotes">
            </div>
            <div class="upperbtns">
                <button id="submitPin" type="button" class="btn">Add</button>
                <button id="cancelPin" type="button" class="btn">Cancel</button>
            </div>
            <button id="clearPin" type="button" class="btn">Delete all Pins</button>
        </form>
    </div>
		`

	Object.assign(pop.style, {
		width: "15vw",
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
		showDialogue("del")
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

	showDialogue("add")
}

function loadPins() {
	const tempScroller = getScroller()

	if (document.getElementById("savedPins")) {
		document.getElementById("savedPins").remove()
	}
	if (document.getElementById("pinPopup")) return

	const url = window.location.href

	chrome.storage.local.get(null, (result) => {
		MARKERS.clear()
		for (const [url, pins] of Object.entries(result)) {
			MARKERS.set(url, pins)
		}

		const currentPins = MARKERS.get(url) || [] // return empty array if no pins

		let savedPins = document.createElement("div")
		savedPins.id = "savedPins"
		savedPins.classList.add("forme")

		let pop = document.createElement("div")
		if (currentPins.length === 0) {
			savedPins.innerText = "No Saved Pins Yet"
		}
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
				document.getElementById("notediv")?.remove()
			})

			// event listener for mouse enter
			let noteDiv

			pinDiv.addEventListener("mouseenter", () => {
				noteDiv = document.createElement("div")
				noteDiv.id = "notediv"
				noteDiv.classList.add("forme")
				noteDiv.textContent = pin.notes || "No notes"

				pop.appendChild(noteDiv)
			})

			pinDiv.addEventListener("mouseleave", () => {
				noteDiv?.remove()
			})

			savedPins.appendChild(pinDiv)
		}

		Object.assign(pop.style, {
			minWidth: "15vw",
			position: "fixed",
			top: "20px",
			right: "20px",
			borderRadius: "8px",
			display: "flex",
			flexDirection: "row-reverse",
			gap: "20px",
			zIndex: 999999,
		})
		document.body.appendChild(pop)
		pop.appendChild(savedPins)
	})
}

function isScrollable(el) {
	const style = getComputedStyle(el)
	const hasScrollableContent = el.scrollHeight > el.clientHeight
	const hasOverflowY =
		style.overflowY === "auto" || style.overflowY === "scroll"

	return hasScrollableContent && hasOverflowY
}

// function scrollerElement() {
// 	let check = 0
// 	// returning window if its the scroller
// 	const winHeight = window.innerHeight
// 	const body = document.body
// 	const fullHeight = body.scrollHeight
// 	if (fullHeight > winHeight + 50) return window

// 	const allElements = document.querySelectorAll("*")
// 	// const scrollables = Array.from(allElements).filter(isScrollable)
// 	const scrollables = Array.from(allElements).filter(el => {
// 	check++
// 	return isScrollable(el)
// })

// 	let maxWidth = 0
// 	let maxWelement = null

// 	// now we will check which scrollable element is main container
// 	for (const el of scrollables) {
// 		check++
// 		// const width = el.getBoundingClientRect().width
// 		const scrollArea = el.scrollHeight * el.scrollWidth

// 		if (scrollArea > maxWidth) {
// 			maxWidth = scrollArea
// 			maxWelement = el
// 		}
// 	}

// 	console.log('check', check)
// 	console.log("Total scrollables found:", scrollables.length)
// 	return maxWelement
// }

function scrollerElement() {
	let check = 0
	// 1️⃣ If window scrolls, use it immediately
	if (document.documentElement.scrollHeight > window.innerHeight + 10) {
		return window
	}

	// 2️⃣ Check body explicitly
	if (isScrollable(document.body)) {
		return document.body
	}

	// 3️⃣ Walk up from a deep element instead of scanning entire DOM
	let el = document.elementFromPoint(
		window.innerWidth / 2,
		window.innerHeight / 2,
	)

	while (el && el !== document.body) {
		check++
		if (isScrollable(el)) {
			console.log("check", check)
			return el
		}
		el = el.parentElement
	}

	console.log("check", check)
	// 4️⃣ Fallback
	return window
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
	if (e.key === "Escape") {
		document.getElementById("pinPopup")?.remove()
		document.getElementById("savedPins")?.remove()
	}
})

window.addEventListener("load", () => {
	const style = document.createElement("style")
	style.textContent = `

	@keyframes scaleUp {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes bounceIn {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  60% {
    transform: scale(1.2);
    opacity: 1;
  }
  80% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
  }
}

.pop, #savedPins, .dialog {
  animation: bounceIn 0.2s ease-out forwards;
}

// .pop, #savedPins, .dialog , #notediv {
//   animation: scaleUp 0.2s ease-out forwards;
// }
  @keyframes scaleDown {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.8);
    opacity: 0;
  }
}

.forme {
	font-family:'Courier New', Courier, monospace;
	color: #3f2205;

	/* width: 100%; */
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: 10px;
	padding-top: 3em;
	padding-left: 2.8em;
	padding-right: 2.8em;
	padding-bottom: 2.1em;
	border: 2px dashed #daa06d;
	border-radius: 15px;
	background-color: #eaddca;
	box-shadow:
		0 0 0 4px #eaddca,
		2px 2px 4px 2px rgba(0, 0, 0, 0.5);
	transition: 0.4s ease-in-out;
}

.forme ::placeholder {
	color: #daa06d;
	text-align: center;
}

.forme .heading {
	padding-left: 0.8em;
	color: #daa06d;
	background-color: transparent;
	letter-spacing: 0.5em;
	text-align: center;
	padding-top: 1em;
	padding-bottom: 1em;
	text-shadow: inset -1px -1px 1px #daa06d;
}

.forme .input {
	outline: none;
	padding: 0.5em;
	border: 1px solid #daa06d;
	color: #daa06d;
	width: 80%;
	height: 3em;
	border-radius: 10px;
	background-color: #eaddca;
	text-align: center;
}

.forme .inputs {
	display: flex;
	flex-direction: column;
	gap: 10px;
	justify-content: center;
	align-items: center;
}

.forme .btn {
	align-self: center;
	/* margin-top: 2em; */
	border-radius: 10px;
	outline: none;
	border: none;
	color: white;
	background-color: #e5aa70;
	font-weight: bold;
	letter-spacing: 0.1em;
	transition:
		0.4s ease-in-out opacity,
		0.1s ease-in-out active;
	padding: 1em;
	box-shadow: 0.5px 0.5px 0.5px 0.5px rgba(0, 0, 0, 0.5);
}

.forme .upperbtns {
	display: flex;
	gap: 30px;
	justify-content: center;
	margin-top: 1em;
}


.forme .btn:hover {
	opacity: 0.8;
}

.forme .btn:active {
	transform: translateX(0.1em) translateY(0.1em);
	box-shadow: none;
}

.writtenTitle {
	background-color: #3f2205;
	padding: 0.8em;
	border-radius: 8px;
	cursor: pointer;
	color: white;
	transition: 0.2s ease;
	color: #eed2b6;
	text-align: center;
}

.writtenTitle:hover {
	/* font-size: large; */
	transform: translateY(-2px) scale(1.1);
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.dialog {
	position: fixed;
	top: 20px; 
	left: 50%; 
	transform: translateX(-50%); 
	width: 250px;
	display: flex;
	justify-content: center;
	padding-block: 1em;
	padding-inline: 1em;
	border: 2px dashed #daa06d;
	border-radius: 15px;
	background-color: #eaddca;
	box-shadow:
		0 0 0 4px #eaddca,
		2px 2px 4px 2px rgba(0, 0, 0, 0.5);
	transition: all 0.4s ease-in-out;
	font-size:large;
	font-family:'Courier New', Courier, monospace;
	color: #3f2205;
	font-weight: 600;
	  z-index: 999999;

}


`
	document.head.appendChild(style)
})

chrome.runtime.onMessage.addListener((message) => {
	if (message.action === "add-pin") addPin()

	if (message.action === "open-pins") loadPins()

	if (message.action === "clear-pins") {
		const url = window.location.href
		MARKERS.delete(url)
		chrome.storage.local.remove(url)
		document.getElementById("savedPins")?.remove()
		showDialogue("del")
	}
})

function showDialogue(action) {
	const dia = document.createElement("div")
	dia.classList.add("dialog")

	dia.innerText =
		action === "add" ? "Pin Added Successfully" : "Pins Deleted Successfully"

	document.body.appendChild(dia)
	const time = setTimeout(() => {
		dia.remove()
	}, 3000)
}
