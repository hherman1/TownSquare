// import * as Config from "./config"
import * as Config from "./config"
import * as Client from "./client"
import * as Render from "./render"

Config.conn.onmessage = function(msg) {
    let us = JSON.parse(msg.data)
    us.forEach(function(u:any) {
        if(u.Pos != undefined) {
            let user = <Client.User> u
            Render.renderUser(user)
            Render.renderUserNotification(user)
        } else if (u.Identity != undefined) {
            self.Sender = u.Identity
            main()
        } else if (u.Closing != undefined) {
            Render.deleteUserByUUID(u.Closing)
        }
        
    })
}

function randomColor() {
    return Math.round(Math.random() * 255)
}

var self: Client.User;
self = {
    Color: {
        R:randomColor(),G:randomColor(),B:randomColor()
    },
    Pos:{
        X:0.5,
        Y:0.5,
    },
    Text:"Hello world!",
    Sender:undefined
}


function main() {
    Render.renderUser(self)
    Render.setUIColor(self)
    Render.disableTransitions(self)
    Client.updateSelfWithServer(self)
}

let mouse = {
    down:false,
    // pos:{x:0,y:0}
}
Config.renderTarget.addEventListener("mousedown",function(e) {
    mouse.down = true;
    Client.setUserPosPixels(self,e.offsetX,e.offsetY)
    Render.renderUser(self);
    Render.renderDragUser(self)
    Render.hideCursor()
})
Config.renderTarget.addEventListener("mousemove",function(e) {
    // mouse.pos.x = e.x
    // mouse.pos.y = e.y
    if(mouse.down) {
        Client.setUserPosPixels(self,e.offsetX,e.offsetY)
        Render.renderUser(self);
    }
})
Config.renderTarget.addEventListener("mouseup",function(e) {
    Client.setUserPosPixels(self,e.offsetX,e.offsetY)
    Client.updateSelfWithServer(self)
    mouse.down = false;
    Render.stopDragUser(self)
    Render.showCursor()
})
document.addEventListener("keypress",function(e) {
    if(e.key == "Enter") 
        Config.textInput.focus()
})
function sendText() {
    if(Config.textInput.value.trim().length > 0) {
        self.Text = Config.textInput.value
        Client.updateSelfWithServer(self)
    }
    Config.textInput.value = ""
    Config.textInput.focus()
}
Config.textInput.addEventListener("keypress",function(e) {
    if(e.key == "Enter" ) {
        sendText()

    }
})
Config.sendTextButton.addEventListener("click",function(e) {
    sendText()
})

var colorLineVisible = false;
Config.colorPickerToggler.addEventListener("click",function() {
    if(colorLineVisible) {
        Config.colorLine.classList.add("hide")
    } else {
        Config.colorLine.classList.remove("hide")
    }
    colorLineVisible = !colorLineVisible;
    
})

function calcGradient(p:number):number[] {
    let colors = [[75,0,130],[0,191,255],[144,238,144],[255,255,0],[255,165,0],[255,0,0]]
    let interval = 1/(colors.length-1)
    let index = Math.floor(p/interval) 
    if(index == colors.length-1) {
        index--;
    }
    let fixedP = (p - index*interval)/interval
    let colorA = colors[index]
    let colorB = colors[index+1]
    return [colorA[0]+fixedP*(colorB[0]-colorA[0]),
    colorA[1]+fixedP*(colorB[1]-colorA[1]),
    colorA[2]+fixedP*(colorB[2]-colorA[2])]
}


var colorLineDown = false;

function setColorFromLine(y:number) {
    let p = y/Config.colorLine.clientHeight;
    if(p < 0 || p > 1) {
        return 
    }
    let col = calcGradient(p);
    self.Color = {
        R:Math.round(col[0]),
        G:Math.round(col[1]),
        B:Math.round(col[2])
    }
    Render.renderUser(self);
    Render.setUIColor(self);
}

Config.colorLine.addEventListener("mousedown",function(e) {
    colorLineDown = true;
    setColorFromLine(e.offsetY)
})
Config.colorLine.addEventListener("mousemove",function(e) {
    if(colorLineDown) {
        setColorFromLine(e.offsetY)
    }
})
Config.colorLine.addEventListener("mouseup",function(e) {
    colorLineDown = false;
    setColorFromLine(e.offsetY)
    Client.updateSelfWithServer(self);
})


var helpTooltipVisible = Config.firstTimePlaying;
Render.renderTooltip(helpTooltipVisible);
Config.helpClose.addEventListener("click",function () {
    helpTooltipVisible = false;
    Render.renderTooltip(helpTooltipVisible);
})
Config.helpToggle.addEventListener("click",function() {
    helpTooltipVisible = !helpTooltipVisible;
    Render.renderTooltip(helpTooltipVisible);

})