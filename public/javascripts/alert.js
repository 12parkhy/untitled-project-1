let closeButton = document.querySelector("#closeButton")
document.addEventListener('click', (event) => {
    if (event.target.parentElement.parentElement.classList.contains('alert')) {
        event.target.parentElement.parentElement.style.display = 'none'
    }
})
