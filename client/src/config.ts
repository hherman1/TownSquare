

export function throwIfNull<T>(element: T | null): T  {
    if(element == null) {
        throw "required element was null"
    }
    return element
}

var url = "ws://hherman.com/townSquare/sock"

export var conn = new WebSocket(url)
export var renderTarget = <HTMLDivElement>throwIfNull(document.getElementById("renderTarget"))
export var textInput = <HTMLInputElement>throwIfNull(document.getElementById("textInput"))
export var sendTextButton = <HTMLButtonElement>throwIfNull(document.getElementById("sendText"))

export var title = <HTMLHeadingElement>throwIfNull(document.getElementById("title"))

export var colorPickerToggler = <HTMLButtonElement>throwIfNull(document.getElementById("picker-toggle"))
export var colorLine = <HTMLDivElement>throwIfNull(document.getElementById("color-line"))


export var helpToggle = <HTMLDivElement>throwIfNull(document.getElementById("help"))
export var helpClose = <HTMLDivElement>throwIfNull(document.getElementById("helpTooltipCloseButton"))
export var helpTooltip = <HTMLDivElement>throwIfNull(document.getElementById("helpTooltip"))

export var firstTimePlaying = true;
function checkFirstTime() {
    let res = window.localStorage.getItem("firstTime")
    if(res == null) {
        window.localStorage.setItem("firstTime",JSON.stringify(true)) // firstTime only the actual first time
        return
    } else {
        firstTimePlaying = false;
    }
}
if(window.localStorage) {
    checkFirstTime()
}

