#!/usr/bin/python
#
# taken from  the excellent http://github.com/larsks/novaconsole.git
#

import sys
import argparse
import websocket
import tty
import termios
import logging
import select
import socket


class UserExit(Exception):
    """
    Raised inside the event loop when someone enters the disconnect
    escape sequence.
    """
    pass


def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument('--escape', '-e',
                   default='~')
    p.add_argument('url')
    return p.parse_args()


def run_until_exit():
    global args

    ws = websocket.create_connection(args.url,
                                     header={
                                         'Sec-WebSocket-Protocol: binary',
                                     })

    poll = select.poll()
    poll.register(ws, select.POLLIN)
    poll.register(sys.stdin, select.POLLIN)

    sol = False  # True if we are at the start of a line
    esc = False  # True if we are looking for an escape sequence

    while True:
        events = poll.poll()
        for fd, event in events:
            if fd == ws.fileno():
                data = ws.recv()
                sys.stdout.write(data)
                sys.stdout.flush()
            elif fd == sys.stdin.fileno():
                data = sys.stdin.read(1)

                if sol and data == args.escape:
                    esc = True
                    continue

                if esc:
                    if data == '.':
                        raise UserExit
                    else:
                        ws.send(args.escape)
                        esc = False

                ws.send(data)

                if data == '\r':
                    sol = True
                else:
                    sol = False


def main():
    global args
    args = parse_args()

    logging.basicConfig(
        level=logging.DEBUG)

    try:
        old_settings = termios.tcgetattr(sys.stdin)
        print '*** connected (type "%s." to exit)' % args.escape
        try:
            tty.setraw(sys.stdin)
            run_until_exit()
        finally:
            # Make sure we restore terminal state
            termios.tcsetattr(sys.stdin, termios.TCSADRAIN, old_settings)
    except socket.error:
        print '*** failed to connect to websocket'
    except UserExit:
        print '*** disconnected'

if __name__ == '__main__':
    main()

