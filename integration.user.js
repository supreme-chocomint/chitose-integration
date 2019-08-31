// ==UserScript==
// @name        Site Integration for Chitose
// @description Adds quick links to https://themightyhotel.bitbucket.io/chi on MAL, AniList, ANN, and AP.
// @author      themightyhotel
// @website     https://bitbucket.org/themightyhotel/chi-integration
// @version     1.0.4
// @include     https://myanimelist.net/people/*
// @include     https://myanimelist.net/people.php?id=*
// @include     https://anilist.co/*
// @include     https://www.animenewsnetwork.com/encyclopedia/people.php?id=*
// @include     https://www.anime-planet.com/people/*
// @grant       GM_addStyle
// ==/UserScript==

var url = window.location.href
var chiRoot = "https://themightyhotel.bitbucket.io/chi/#"

if (url.includes("myanimelist")) doMAL()
else if (url.includes("anilist")) doAniList()
else if (url.includes("animenewsnetwork")) doANN()
else if (url.includes("anime-planet")) doAP()

function doMAL() {
    let name = document.querySelector(".h1").textContent
    appendSearchLink(name, document.querySelector("#profileRows"))
}

function doAniList() {

    // AniList has a loading screen, so need to wait for it.
    // It also only dispatches DOMContentLoaded once (I guess), so need to start watching as
    // soon as you enter site, and keep watching indefinitely.
    // https://stackoverflow.com/a/16726669
    let observer = new MutationObserver(function(mutations, observer) {
        for (let mutation of mutations) {

            // Only proceed if required nodes added, links don't already exist, AND on a staff page.
            if (!mutation.addedNodes) return
            let header = document.querySelector(".header")
            let name = document.querySelector("h1").textContent
            let existingLinks = document.querySelector(".chitose_link")
            if (header == null
                || name == null
                || existingLinks != null
                || !window.location.href.includes("staff")
               ) return

            // Get numbers from URL, which is the ID used on Chitose
            let id = window.location.href.match(/(\d+)/)[1]

            appendSearchLink(name, header.querySelector(".content"))
            appendProfileLink(id, header.querySelector(".content"))
            GM_addStyle (`
                .chitose_link {
                    font-size: 1.4rem;
                    line-height: 1.5;
                }
            `)
            break
        }
    })

    // Observing sometimes doesn't fire when page loading in background and set to document.body 
    // + childList/subtree options, so bandaid the issue by casting a wide net.
    // If links missing after load, they will be added on scroll or on mouse click.
    observer.observe(document, {childList: true, characterData: true, attributes: true, subtree: true})
}

function doANN() {
    let name = document.querySelector("#page_header").textContent
    let container = document.createElement("span")
    container.innerHTML = "<br />"
    appendSearchLink(name, container)
    document.querySelector("#page-title").appendChild(container)
}

function doAP() {
    let name = document.querySelector("[itemprop=name]").textContent
    let container = document.createElement("p")
    appendSearchLink(name, container)
    document.querySelector("[itemprop=description]").appendChild(container)
}

function appendSearchLink(searchReference, container) {
    let searchLink = document.createElement("a")
    searchLink.classList.add("chitose_link")
    searchLink.innerHTML = "Search on Chitose<br />"
    searchLink.href = chiRoot + searchReference.trim()
    container.appendChild(searchLink)
}

function appendProfileLink(id, container) {
    let profileLink = document.createElement("a")
    profileLink.classList.add("chitose_link")
    profileLink.innerHTML = "View Profile on Chitose<br />"
    profileLink.href = chiRoot + id.trim()
    container.appendChild(profileLink)
}