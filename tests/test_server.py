# coding:utf-8

import os
from tornado.testing import AsyncHTTPTestCase
import server
import urllib


class BaseTestCase(AsyncHTTPTestCase):
    def get_app(self):
        return server.Application()

    def decode_body(self, response):
        encode_type = "UTF-8"
        content_type = response.headers["Content-Type"]
        charset_part = "charset="
        charset_index = content_type.lower().find(charset_part)
        if charset_index > 0:
            encode_type = content_type[(charset_index + len(charset_part)):]
            encode_type = encode_type.split(";")[0]
        decoded = response.body.decode(encode_type)
        return decoded

class TestIndexHandler(BaseTestCase):
    def test_get(self):
        params = {}
        response = self.fetch("/?{}".format(urllib.parse.urlencode(params)),
                              method="GET")
        self.assertEqual(response.code, 200)
