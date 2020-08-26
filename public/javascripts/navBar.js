document.addEventListener('click', (event) => {
    if (!event.target.isSameNode(navbarDropdownInfo) && document.querySelector("#dropdown-info-menu").classList.contains('show')) {
        document.querySelector("#dropdown-info-menu").classList.remove('show')
    } else if (!event.target.isSameNode(navbarDropdownBooks) && document.querySelector("#dropdown-books-menu").classList.contains('show')) {
        document.querySelector("#dropdown-books-menu").classList.remove('show')
    }
})
let navbarTogglerIcon = document.querySelector('.navbar-toggler-icon')
navbarTogglerIcon.addEventListener('click', (event) => {
    if (!document.querySelector("#navbarNav").classList.contains('show')) {
        document.querySelector("#navbarNav").classList.add("show")
    } else if (document.querySelector("#navbarNav").classList.contains('show')) {
        document.querySelector("#navbarNav").classList.remove('show')
    }
})
let navbarDropdownInfo = document.querySelector('#navbarDropdownInfo')
navbarDropdownInfo.addEventListener('click', (event) => {
    if (document.querySelector("#dropdown-info-menu").classList.contains('show')) {
        document.querySelector("#dropdown-info-menu").classList.remove('show')
    } else if (!document.querySelector("#dropdown-info-menu").classList.contains('show')) {
        document.querySelector("#dropdown-info-menu").classList.add('show')
    }
})
let navbarDropdownBooks = document.querySelector('#navbarDropdownBooks')
navbarDropdownBooks.addEventListener('click', (event) => {
    if (document.querySelector("#dropdown-books-menu").classList.contains('show')) {
        document.querySelector("#dropdown-books-menu").classList.remove('show')
    } else if (!document.querySelector("#dropdown-books-menu").classList.contains('show')) {
        document.querySelector("#dropdown-books-menu").classList.add('show')
    }
})