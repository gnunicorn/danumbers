#!/usr/bin/env python

#from google.appengine.ext.ndb import Key
#from google.appengine.api import mail

from utils import logged_in, verified_api_request

import webapp2
#import models


class MainHello(webapp2.RequestHandler):

    @verified_api_request
    def get(self):
        return {"access": "granted"}

    @verified_api_request
    def post(self):
        return {"access": "granted"}

app = webapp2.WSGIApplication([
    ('./hello', MainHello)
], debug=True)
