function addPin() {
	const MARKERS = new Map()

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
    const title = document.getElementById("pinTitle")
    const notes = document.getElementById("pinNotes")

    
}
