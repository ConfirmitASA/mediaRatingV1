document.addEventListener('DOMContentLoaded', function(){
    /* tooltip */
    function tooltipToggle(el) {
        el.addEventListener("mouseenter", function() {
            tooltipShow(el);
        });
        el.addEventListener("mouseleave", function() {
            tooltipHide();
        });
    }

    function tooltipShow(element) {
        let text = element.dataset.tooltipText;
        let position = {
            left: element.offsetLeft,
            top: element.offsetTop
        };
        let ttBox = document.getElementById("tooltipBox");
        ttBox.style.display = "block";
        ttBox.getElementsByClassName("comd-tooltip__inner")[0].textContent = text;
        ttBox.style.top = position.top - ttBox.offsetHeight/2 + 7 + "px";
        ttBox.style.left = position.left + 22 + "px";
    }

    function tooltipHide() {
        let ttBox = document.getElementById("tooltipBox");
        ttBox.style.display = "none";
        ttBox.getElementsByClassName("comd-tooltip__inner")[0].textContent = "";
    }

    let tooltips = document.getElementsByClassName("sd-tooltip-help");
    Array.prototype.forEach.call(tooltips, tooltipToggle);

    /* collapse panel */
    let collapsePanels = document.getElementsByClassName("comd-panel");
    Array.prototype.forEach.call(collapsePanels, collapseDefault);
    let collapseBtns = document.getElementsByClassName("node-properties__header");
    Array.prototype.forEach.call(collapseBtns, collapseToggle);

    function collapseDefault(el) {
        collapseStyles(el);
    }

    function collapseToggle(el) {
        el.addEventListener("click", function() { collapseHandler(el) });
    }

    function collapseHandler(el) {
        el.parentElement.classList.toggle("comd-panel--collapsed");
        collapseStyles(el.parentElement);
    }

    function collapseStyles(el) {
        if(el.classList.contains("comd-panel--collapsed")) {
            el.getElementsByClassName("collapse-button")[0].style.transform = "rotateZ(180deg)";
        } else {
            el.getElementsByClassName("collapse-button")[0].style.transform = "rotateZ(0deg)";
        }
    }
});