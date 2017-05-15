package main

import (
	"net/http"
	"os"

	"log"

	"sync"

	"encoding/json"

	"github.com/gorilla/websocket"
	uuid "github.com/satori/go.uuid"
)

type Pos struct {
	X float32
	Y float32
}
type RGB struct {
	R uint8
	G uint8
	B uint8
}
type Message struct {
	Pos    Pos
	Color  RGB
	Text   string
	Sender uuid.UUID
}
type CloseMessage struct {
	Closing uuid.UUID
}
type Room struct {
	msgs       chan interface{}
	curMessage *websocket.PreparedMessage
	waiter     *sync.Cond
}
type Client struct {
	conn *websocket.Conn
	name uuid.UUID
}

func MakeRoom() Room {
	return Room{
		msgs:   make(chan interface{}, 100),
		waiter: sync.NewCond(&sync.Mutex{}),
	}
}

var room Room

var upgrader websocket.Upgrader

func init() {
	upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin:     func(r *http.Request) bool { return true },
	}
	room = MakeRoom()
}

func onClientMessage(c *Client) {
	msg := new(Message)
	for {
		err := c.conn.ReadJSON(&msg)
		if err, ok := err.(*websocket.CloseError); ok {
			log.Println(err)
			room.msgs <- CloseMessage{Closing: c.name}
			log.Println("Client " + c.name.String() + " disconnected.")
			return
		} else if err != nil {
			log.Println(err)
			continue
		}
		if len(msg.Text) > 140 {
			msg.Text = msg.Text[:140]
		}
		msg.Sender = c.name
		room.msgs <- msg
	}
}
func sendToClientLoop(c *Client) {
	for {
		room.waiter.L.Lock()
		room.waiter.Wait()
		room.waiter.L.Unlock()

		err := c.conn.WritePreparedMessage(room.curMessage)
		if err != nil {
			log.Println(err)
			return
		}
	}
}

func sock(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	cli := Client{conn: conn, name: uuid.NewV4()}
	err = conn.WriteMessage(websocket.TextMessage, []byte(`
	[{
		"Identity":"`+cli.name.String()+`"	
	}]`))
	if err != nil {
		log.Println(err)
		return
	}
	log.Println("Client " + cli.name.String() + " joined.")
	go onClientMessage(&cli)
	go sendToClientLoop(&cli)

}

func distRoomMessages() {
	msgs := make([]interface{}, 100)
	for {
		msgs = msgs[:0]
		msg := <-room.msgs
		msgs = append(msgs, msg)
	finish:
		for {
			select {
			case msg = <-room.msgs:
				msgs = append(msgs, msg)
			default:
				break finish
			}
		}
		dist, err := json.Marshal(&msgs)
		if err != nil {
			log.Println(err)
			continue
		}
		pm, err := websocket.NewPreparedMessage(websocket.TextMessage, dist)
		if err != nil {
			log.Println(err)
			continue
		}
		room.curMessage = pm
		room.waiter.Broadcast()
	}
}

func main() {
	go distRoomMessages()
	http.HandleFunc("/sock", sock)
	port := ":" + os.Args[1]
	log.Fatalln(http.ListenAndServe(port, nil))
}
