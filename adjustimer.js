window.onload = () => {   
    const switchBackGroundElement = document.getElementById("switch_background");
    switchBackGroundElement.addEventListener("change", (e) => {
        const wrapper = document.getElementById("wrapper");
        if (e.target.checked) {
            // グリーンバック
            wrapper.style.backgroundColor = "lime";
        } else {
            wrapper.style.backgroundColor = "white";
        }
    })
}