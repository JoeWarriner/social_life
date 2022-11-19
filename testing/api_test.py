import pytest
import requests
import json
from pathlib import Path
import decouple
import pymongo

config = decouple.Config(decouple.RepositoryEnv(Path.cwd().parent.absolute().joinpath('.env')))
client = pymongo.MongoClient(config.get('MONGO_DB_URL'))

BASE_URL = 'http://localhost:3000/'
REGISTER_URL = BASE_URL + 'auth/register'
LOGIN_URL = BASE_URL + 'auth/login'
BASIC_WALL_POST = BASE_URL + 'wall_post/'


# Clear database before each testing round:
for collection in client.social_life.list_collection_names():
    client.social_life.drop_collection(collection)


class User:

    def __init__(self, username, password):
        self.username = username
        self.password = password

    def register(self):
        response = requests.post(
            REGISTER_URL, 
            json = {
                'username': self.username,
                'password': self.password
            }
        )
        assert response.ok
        assert response.json()['username'] == self.username
        assert response.json()['password'] != self.password
    

    def get_token(self):
        response = requests.post(
            LOGIN_URL, 
            json = {
                'username': self.username,
                'password': self.password
            }
        )
        assert response.ok
        self.token = response.json()['auth_token']

    def call_api_no_token(self):
        response = requests.get(
            BASIC_WALL_POST
            )
        assert not response.ok


    def make_post(self, title, text):
        response = requests.post(
            BASIC_WALL_POST,
            json = {
                'title': title,
                'text': text
            },
            headers = {'auth-token': self.token}
            )
        assert response.ok



olga = User('olga01', 'olga_pass')
nick = User('nick01', 'nick_pass')
mary = User('mary01', 'mary_pass')


def test_tc1(): 
    '''
    TC 1. Olga, Nick and Mary register in the application and access the API. 
    '''
    olga.register()
    nick.register()
    mary.register()


def test_tc2():
    '''
    TC 2. Olga, Nick and Mary will use the oAuth v2 authorisation service to get their tokens.
    '''
    olga.get_token()
    nick.get_token()
    mary.get_token()


def test_tc3():
    """Olga calls the API (any endpoint) without using a token. This call should be unsuccessful as the user is unauthorised."""
    olga.call_api_no_token()

def test_tc4():
    """Olga posts a text using her token. """
    olga.make_post("Olga's post", "Hi - I'm Olga")

# def test_tc5():
#     """Nick posts a text using his token. """
#     pass

# def test_tc6():
#     """Mary posts a text using her token. """
#     pass

# def test_tc7():
#     """Nick and Olga browse available posts in chronological order in the MiniWall; there should be three posts available. Note, that we don’t have any likes yet. """
#     pass

# def test_tc8():
#     """Nick and Olga comment Mary's post in a round-robin fashion (one after the other)."""
#     pass

# def test_tc9():
#     """Mary comments her post. This call should be unsuccessful; an owner cannot comment owned posts. """
#     pass

# def test_tc1():
#     """ Mary can see posts in a chronological order (newest posts are on the top as there are no likes yet). """
#     pass

# def test_tc1():
#     """ Mary can see the comments for her posts. """
#     pass

# def test_tc1():
#     """ Nick and Olga like Mary's posts"""
#     pass

# def test_tc1():
#     """ Mary likes her posts. This call should be unsuccessful; an owner cannot like their posts. """
#     pass

# def test_tc1():
#     """ Mary can see that there are two likes in her posts. """
#     pass

# def test_tc1():
#     """ Nick can see the list of posts, since Mary's post has two likes it is shown at the top."""
#     pass



# # Other tests:

# # def setup_testing():
    
# #     return olga, nick, mary



    


# # @pytest.fixture
# # def authorise_tokens():



# # @pytest.fixture()
# # def teardown():
# #     '''Wipe database after each test'''
# #     yield
# #     for collection in client.social_life.list_collection_names():
# #             client.social_life.drop_collection(collection)



    

    


