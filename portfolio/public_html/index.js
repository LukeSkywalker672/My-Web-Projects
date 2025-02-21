g_smallDesign = false;

function moveLastChild(sourceElement, targetElement) {
    if (sourceElement.lastElementChild) {
        targetElement.appendChild(sourceElement.lastElementChild);
    }
}

function toSmalldesign() {
    function shiftIntoNewBox(parentDiv) {
        div = document.createElement("div");
        div.classList.add("box");
        parentDiv.appendChild(div);
        moveLastChild(parentDiv.children[0], div);
        moveLastChild(parentDiv.children[1], div);
    }


    if(g_smallDesign) return;
    g_smallDesign = true;

    shiftIntoNewBox(projects);
    shiftIntoNewBox(degrees);
}

function toBigDesign() {
    function shiftBackDelte3rdBox(parentDiv) {
        let boxes = parentDiv.children;
        console.assert(boxes.length === 3, "Anzahl der projects.children boxes für die cards ist falsch");
        moveLastChild(boxes[2], boxes[0]);
        moveLastChild(boxes[2], boxes[1]);
        boxes[2].remove();
    }

    if(!g_smallDesign) return; //Only continute if small design
    g_smallDesign = false;

    shiftBackDelte3rdBox(projects);
    shiftBackDelte3rdBox(degrees);
}

if(window.innerWidth < 1100) toSmalldesign();

//window.addEventListener("resize", () => console.log(window.innerWidth));
window.addEventListener("resize", () => {window.innerWidth < 1100 ? toSmalldesign() : toBigDesign();});
