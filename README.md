Mini Canvas Editor — Solar Ladder SDE Task

What I Built
A stateless, shareable 2D canvas editor inspired by Canva, built with React, Fabric.js, and Firebase Firestore.
Users can create and edit a canvas by adding rectangles, circles, text, and freehand drawings (Pen Tool), modify and arrange objects, change colors and text, and instantly share their work via a unique public link—no login required.
Key Features:
•	Add/Edit rectangles, circles, text, and draw freely
•	Move, resize, rotate, delete objects
•	Change color and text on selected objects
•	Auto-save & real-time persistence (debounced) via Firestore
•	URL-based scenes (/canvas/:id): each canvas is a stateless, shareable link
•	"Share Canvas" button: instant copying and collaborative access
•	Undo/Redo, Export as PNG, Object Lock/Unlock, View-only mode via ?viewOnly=true
Live Demo:
canvabyme.netlify.app
 
Trade-Offs Made
1. Stateless Design, Simple Shareability
•	Chose stateless scene management via URL over user authentication anyone with the link can edit the canvas, as specified.
•	Used Firestore for state persistence for a lightweight, real-time experience.

2. Real-Time vs. Debounced Saving
•	Instead of saving every small canvas action, used debounce logic to reduce unnecessary writes to Firestore (improves cost and performance).

3. Object Lock/Unlock UX
•	For "Object Locking": Locked objects can't be selected for unlock individually, so provided a global "Unlock All" button in the toolbar.

4. View-Only Mode Simplicity
•	Implemented view-only mode as a URL param (?viewOnly=true), disabling all editing via code and UI; simple logic, robust for most use cases.

5. Deployment
•	Chose Netlify for rapid, simple static hosting. Used SPA routing fix (_redirects file) for deep-link compatibility.

6. Minimal Dependencies
•	Leveraged Fabric.js for canvas manipulation, lodash.debounce for auto-save optimization, and react-icons for clear visually accessible controls.
 
Bonus Features Included
•	Undo/Redo
•	Export as PNG
•	Object Lock/Unlock
•	View-only mode via link (?viewOnly=true)
 
To Run Locally
1.	git clone this repo
2.	npm install
3.	Add your Firebase config in the project as required
4.	npm start — open http://localhost:3000
 
Highlighted Points Checklist
•	Modular React components
•	Hooks-based state and scene management
•	Smooth object manipulation via Fabric.js
•	Efficient Canvas state saving with Firestore and debounce
•	Scene ID URL routing (/canvas/:id)
•	Thoughtful product-level UX touches
 
  
Thank you for reviewing!
 
                                                            ⁂
