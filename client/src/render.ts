import {User} from "./client"
import * as Config from "./config"

type RGB = {
    R:number,
    G:number,
    B:number,
}
export function complement(col:RGB) {
    return {
        R:255-col.R,
        G:255-col.G,
        B:255-col.B,
    }
}

function IDFromUUID(uuid:string) {
    return "gameID-"+uuid
}
function getID(u:User):string {
    return IDFromUUID(<string>u.Sender)
}
function getUserDOM(u:User):HTMLDivElement|null {
    return <HTMLDivElement|null> document.getElementById(getID(u))
}
function getUserDOMByUUID(uuid:string):HTMLDivElement|null {
    return <HTMLDivElement|null> document.getElementById(IDFromUUID(uuid))
}
function makeUserDOM(u:User) {
    let el = document.createElement("div")
    el.className = "user-el"
    el.id = getID(u)
    let visual = document.createElement("div")
    visual.className = "user-visual"
    el.appendChild(visual)

    let anim = document.createElement("div")
    anim.className = "user-anim"
    visual.appendChild(anim)

    let dot = document.createElement("div");
    dot.className = "user-dot";
    let textBlock = document.createElement("div");
    textBlock.className = "user-text";

    anim.appendChild(dot)
    anim.appendChild(document.createElement("br"))
    anim.appendChild(textBlock)

    setUserDOMAttributes(el,u)


    anim.addEventListener("animationend",function(e) {
        anim.classList.remove("notify")
    })

    return el
}
function setUserDOMAttributes(el:HTMLDivElement,u:User) {
    el.style.transform = "translate("
    +u.Pos.X*100+"%,"
    +u.Pos.Y*100+"%)"

    let anim = <HTMLDivElement>Config.throwIfNull(Config.throwIfNull(el.firstChild).firstChild)
    let dot = <HTMLDivElement>Config.throwIfNull(anim.firstChild)

    dot.style.backgroundColor = "rgb("
    +Math.round(u.Color.R)+","
    +Math.round(u.Color.G)+","
    +Math.round(u.Color.B)+")"

    let textDiv = <HTMLDivElement>Config.throwIfNull(anim.lastChild)
    textDiv.textContent = u.Text
}

export function renderUser(u:User) {
    let el = getUserDOM(u)
    if(el == null) {
        let newEl = makeUserDOM(u)
        Config.renderTarget.appendChild(newEl)
    } else {
        setUserDOMAttributes(el,u)
    }
}
export function renderUserNotification(u:User) {
    let el = getUserDOM(u)
    if(el != null) {
        let anim = <HTMLDivElement>Config.throwIfNull(Config.throwIfNull(el.firstChild).firstChild)
        anim.classList.add("notify")
    } 
}
export function deleteUserByUUID(uuid:string) {
    let el = getUserDOMByUUID(uuid)
    if(el != null) {
        let anim = <HTMLDivElement>Config.throwIfNull(Config.throwIfNull(el.firstChild).firstChild)
        anim.classList.add("deleting")
        anim.addEventListener("animationend",function() {
            if(el != null) {
                Config.throwIfNull(el.parentNode).removeChild(el)
            }
        })
    } 
}
export function disableTransitions(u:User) {
    let el = Config.throwIfNull(getUserDOM(u))
    el.style.transition = "none";

    let anim = <HTMLDivElement>Config.throwIfNull(Config.throwIfNull(el.firstChild).firstChild)
    let dot = <HTMLDivElement>Config.throwIfNull(anim.firstChild)
    dot.style.transition = "none";

}
export function renderDragUser(u:User) {
    let el = getUserDOM(u)
    if(el != null) {
        let anim = <HTMLDivElement>Config.throwIfNull(Config.throwIfNull(el.firstChild).firstChild)
        anim.classList.add("dragging")
        let dot = <HTMLDivElement>Config.throwIfNull(anim.firstChild)
        dot.style.borderColor = colorString(complement(u.Color))
    } 
}
export function stopDragUser(u:User) {
    let el = getUserDOM(u)
    if(el != null) {
        let anim = <HTMLDivElement>Config.throwIfNull(Config.throwIfNull(el.firstChild).firstChild)
        anim.classList.remove("dragging")
        let dot = <HTMLDivElement>Config.throwIfNull(anim.firstChild)
        dot.style.borderColor = "black"

    } 
}
export function hideCursor() {
    Config.renderTarget.classList.add("hide-mouse")
}
export function showCursor() {
    Config.renderTarget.classList.remove("hide-mouse")
}

function colorString(col:RGB) {
    return "rgb("+col.R+","+col.G+","+col.B+")"
}

export function setUIColor(u:User) {
    Config.title.style.color = colorString(u.Color)
    Config.colorPickerToggler.style.borderColor = colorString(u.Color)
}

export function showTooltip() {
    Config.helpTooltip.classList.remove("hide")
}
export function hideTooltip() {
    Config.helpTooltip.classList.add("hide")
}
export function renderTooltip(visible: boolean) {
    if(visible) {
        showTooltip()
    } else {
        hideTooltip()
    }
}