#!/usr/bin/env python

#from google.appengine.ext.ndb import Key
#from google.appengine.api import mail

from utils import as_json, verified_api_request, understand_post
from google.appengine.api import users

from google.appengine.ext import ndb

import webapp2
#import models


class Profile(ndb.Model):
    created = ndb.DateTimeProperty('c', auto_now_add=True)
    name = ndb.StringProperty('n')
    owner = ndb.UserProperty()

    def prepare_json(self):
        data = self.to_dict()
        data.pop("created")
        data.pop("owner")
        data["id"] = self.key.id()
        return data


class Collector(ndb.Model):
    # parent = Profile
    created = ndb.DateTimeProperty('c', auto_now_add=True)
    frequency = ndb.StringProperty('f', default='daily', choices=['hourly', 'daily', 'weekly', 'monthly'])
    collector = ndb.StringProperty('k', choices=['meetup', 'facebook', 'twitter'])
    collect = ndb.StringProperty('t', repeated=True)


class DataPoint(ndb.Model):
    # parent = Collector
    timestamp = ndb.DateTimeProperty('c', auto_now_add=True)
    key = ndb.StringProperty('k')
    value = ndb.FloatProperty('v')


class ModelRestApi(webapp2.RequestHandler):
    model_cls = None
    no_item_raise = False
    writeable = ()

    def _get(self, item_id=None):
        # list service
        if not item_id:
            return [x.prepare_json() for x in self._get_query().fetch(100)]

        # specific item requested
        item = self._get_item_key(item_id).get()
        item_data = {}
        if item:
            item_data = item.prepare_json()
        elif self.no_item_raise:
            webapp2.abort(404, "Item not found")
        return item_data

    @understand_post
    def _post(self, params, item_id=None):
        if item_id:
            model = self._get_item_key(item_id).get()
            if model:
                return self._update_item(model, params)
            elif self.no_item_raise:
                webapp2.abort(404, "Item not found")
        return self._add_item(params)

    def _update_item(self, model, params):
        model.populate(**self._decorate_params(params))
        model.put()
        self._post_update(model, params)
        return model.prepare_json()

    def _post_update(self, model, params):
        pass

    def _add_item(self, params):
        model = self.model_cls(**params)
        model.put()
        self._post_add(model, params)
        return model.prepare_json()

    def _post_add(self, model, params):
        pass

    def _get_item_key(self, item_id):
        return ndb.Key(self.model_cls, self._decorate_item_id(item_id),
                parent=self.app_access.key)

    def _get_query(self):
        return self._decorate_query(self.model_cls.query())

    def _decorate_item_id(self, item_id):
        return item_id

    def _decorate_query(self, query):
        return query

    def _decorate_params(self, params):
        res_params = {}
        for key in self.writeable:
            if key in params:
                res_params[key] = params[key]
        return res_params

    ## make them accessible from the outside
    get = verified_api_request(_get)
    post = verified_api_request(_post)


class ProfilesHandler(ModelRestApi):
    model_cls = Profile

    def _add_item(self, params):
        model = self.model_cls(owner=self.user, **params)
        model.put()
        self._post_add(model, params)
        return model.prepare_json()


class LoginHandler(webapp2.RequestHandler):

    def get(self):
        return webapp2.redirect(users.create_login_url("/"))


class CheckLogin(webapp2.RequestHandler):

    @as_json
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

app = webapp2.WSGIApplication([
    ('/api/v1/profiles/(\d*?)', ProfilesHandler),
    ('/api/v1/profiles', ProfilesHandler),
    ('/login', LoginHandler),
    ('/api/v1/me/', CheckLogin)
], debug=True)
