# coding:utf-8

import os
import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web
import tornado.websocket
import tornado.escape
import tornado.autoreload
from tornado.options import define, options
import logging


# slide を表示しているクライアントを格納
slide_waiters = set()


class IndexHandler(tornado.web.RequestHandler):
    def get(self):
        self.redirect("/slide")


class SlideHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("slide.html")


class ControllerHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("controller.html", messages=SlideSocketHandler.command_cache)


class SlideSocketHandler(tornado.websocket.WebSocketHandler):

    command_cache = []
    command_cache_size = 200

    def check_origin(self, origin):
        return True

    def get_compression_options(self):
        # Non-None enables compression with default options.
        return {}

    # slide.htmlでコネクションが確保されクライアントを追加する
    def open(self):
        if self not in slide_waiters:
            slide_waiters.add(self)

    # slide.htmlからメッセージが送られてくると呼び出される
    def on_message(self, message):
        logging.info("got message %r", message)
        parsed = tornado.escape.json_decode(message)
        command = {"keyCode": parsed["keyCode"],
                   "slidePage": parsed["slidePage"]}

        SlideSocketHandler.update_cache(command)
        SlideSocketHandler.send_updates(command)

    # slide.htmlが閉じ、コネクションが切れる事でクライアントが削除される
    def on_close(self):
        if self in slide_waiters:
            slide_waiters.remove(self)

    @classmethod
    def update_cache(cls, command):
        cls.command_cache.append(command)
        if len(cls.command_cache) > cls.command_cache_size:
            cls.command_cache = cls.command_cache[-cls.command_cache_size:]

    @classmethod
    def send_updates(cls, command):
        logging.info("sending message to %d waiters", len(slide_waiters))
        for waiter in slide_waiters:
            try:
                waiter.write_message(command)
            except:
                logging.error("Error sending message", exc_info=True)


class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
            (r"/", IndexHandler),
            (r"/slide", SlideHandler),
            (r"/controller", ControllerHandler),
            (r"/ws", SlideSocketHandler),
        ]
        settings = dict(
            debug=True,
            cookie_secret="__TODO:_GENERATE_YOUR_OWN_RANDOM_VALUE_HERE__",
            template_path=os.path.join(os.path.dirname(__file__), "templates"),
            static_path=os.path.join(os.path.dirname(__file__), "static"),
            xsrf_cookies=True,
        )
        tornado.web.Application.__init__(self, handlers, **settings)


def main():
    tornado.options.parse_command_line()
    http_server = tornado.httpserver.HTTPServer(Application())
    port = int(os.environ.get("PORT", 80))
    http_server.listen(port)
    tornado.ioloop.IOLoop.current().start()


if __name__ == "__main__":
    main()
