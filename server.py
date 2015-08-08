# coding:utf-8

import os
import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web
from tornado.options import define, options


class SlideHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("slide.html")


class RemoteHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("remote.html")


class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
            (r"/", SlideHandler),
            (r"/remote", RemoteHandler),
        ]
        settings = dict(
            cookie_secret="__TODO:_GENERATE_YOUR_OWN_RANDOM_VALUE_HERE__",
            template_path=os.path.join(os.path.dirname(__file__), "templates"),
            static_path=os.path.join(os.path.dirname(__file__), "static"),
            xsrf_cookies=False,
        )
        tornado.web.Application.__init__(self, handlers, **settings)


def main():
    tornado.options.parse_command_line()
    http_server = tornado.httpserver.HTTPServer(Application())
    port = int(os.environ.get("PORT", 5000))
    http_server.listen(port)
    tornado.ioloop.IOLoop.current().start()

if __name__ == "__main__":
    main()
