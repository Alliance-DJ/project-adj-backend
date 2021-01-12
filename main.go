package main

import (
	"fmt"
	"log"
	"net"
)

func main() {
	runSocket()
}

func runSocket() {
	url := "127.0.0.1:15977"
	fmt.Println("listen on: ", url)

	ln, err := net.Listen("tcp", url)
	if err != nil {
		log.Println("err: ", err)
	}

	for {
		conn, err := ln.Accept()
		if err != nil {
			log.Println("err: ", err)
		}

		tcpConn := conn.(*net.TCPConn)
		go handleConnection(tcpConn)
	}
}

func handleConnection(tcpConn *net.TCPConn) {
	b := make([]byte, 256)

	_, err := tcpConn.Read(b)
	if err != nil {
		log.Println("err: ", err)
	} else {
		log.Println("msg: ", string(b))
	}
}
