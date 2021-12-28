import * as Config from "./config"

export type User = {
    Pos:{
        X:number,
        Y:number
    },
    Color: {
        R:number,
        G:number,
        B:number
    },
    Text:string,
    Sender:string|undefined

}

//Deletes Sender
export function updateSelfWithServer(self:User) {
    let Sender = self.Sender
    self.Sender = undefined
    Config.conn.send(JSON.stringify(self))
    self.Sender = Sender
}

export function setUserPosPixels(u:User,x:number,y:number) {
    u.Pos.X = x/Config.renderTarget.clientWidth
    u.Pos.Y = y/Config.renderTarget.clientHeight
}