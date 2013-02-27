#!/usr/bin/env python

#from google.appengine.ext.ndb import Key
#from google.appengine.api import mail

from utils import logged_in, verified_api_request
from google.appengine.api import users

import webapp2
#import models

class LoginHandler(webapp2.RequestHandler):

    def get(self):
        webapp2.redirect(users.create_login_url("/"))


class CheckLogin(webapp2.RequestHandler):

    @verified_api_request
    def get(self):
        user = users.get_current_user()
        if not user:
            return {}
        return {
            'id': user.user_id(),
            'email': user.email(),
            'nickname': user.nickname(),
            'is_admin': users.is_current_user_admin()
        }


class MainHello(webapp2.RequestHandler):

    @verified_api_request
    def get(self):
        return {"access": "granted"}

    @verified_api_request
    def post(self):
        return {"access": "granted"}

app = webapp2.WSGIApplication([
    ('/login', LoginHandler),
    ('/api/v1/me/', CheckLogin),
    ('./hello', MainHello)
], debug=True)
