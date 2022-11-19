import pytest
import requests
from pathlib import Path
import decouple
import pymongo

try:
    config = decouple.Config(decouple.RepositoryEnv(Path.cwd().joinpath('.env')))
except FileNotFoundError as error:
    print('ERROR: Test script needs to be run fom same directory as .env')
    raise error
    
    

client = pymongo.MongoClient(config.get('MONGO_DB_URL'))

BASE_URL = 'http://localhost:3000/'
REGISTER_URL = BASE_URL + 'auth/register'
LOGIN_URL = BASE_URL + 'auth/login'

BASIC_WALL_POST = BASE_URL + 'wall_post/'
ADD_COMMENT = BASIC_WALL_POST + 'comment/'
COMMENT_LIKE_SUMMARY = BASIC_WALL_POST + '/comment_like_summary'
LIKE_POST = BASIC_WALL_POST + 'like/'

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
        self.id = response.json()['_id']
    

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
        post = response.json()
        assert post['title'] == title
        assert post['text'] == text
        assert post['owner'] == self.id
        assert post['timestamp'] is not None
        assert post['comments'] == []
        assert post['likes'] == 0
        self.post_id = post['_id']

    def browse_posts(self, expected_order = []):
        response = requests.get(
            BASIC_WALL_POST,
            headers = {'auth-token': self.token}
            )
        assert response.ok
        posts =  response.json()
        titles = [post['title'] for post in posts]
        assert titles == expected_order
    
    def add_comment(self, post_id, comment, expected_comment_number = None, access_expected = True):
        response = requests.post(
            ADD_COMMENT,
            json = {
                'postId': post_id,
                'comment' : comment
            },
            headers = {'auth-token': self.token}
        )
        if access_expected:
            assert response.ok
            updated_post = response.json()
            assert updated_post['_id'] == post_id
            assert updated_post['comments'][expected_comment_number]['comment'] == comment
            assert updated_post['comments'][expected_comment_number]['owner_id'] == self.id
        if not access_expected:
            assert not response.ok
        
        
    def view_user_comments(self, expected_commenters):
        response = requests.get(
            COMMENT_LIKE_SUMMARY,
            headers = {'auth-token': self.token}
        )
        assert response.ok
        comments = response.json()['comments']
        print(comments)
        assert comments[0]['owner_id'] == expected_commenters[0]
        assert comments[1]['owner_id'] == expected_commenters[1]
    

    def get_user_likes(self, expected_likes):
        response = requests.get(
            COMMENT_LIKE_SUMMARY,
            headers = {'auth-token': self.token}
        )
        assert response.ok
        assert response.json()['likes'] == expected_likes

        
    def like_post(self, post_id, expected_likes = None, access_expected = True):
        response = requests.post(
            LIKE_POST,
            json = {
                'postId':  post_id
            },
            headers = {'auth-token': self.token}
        )
        if access_expected:
            assert response.ok
            post = response.json()
            assert post['likes'] == expected_likes
        else:
            assert not response.ok

    


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
    """Olga calls the API (any endpoint) without using a token. 
    This call should be unsuccessful as the user is unauthorised."""
    olga.call_api_no_token()

def test_tc4():
    """Olga posts a text using her token. """
    olga.make_post("Olga's post", "It was a bright, cold day in April and the clocks were striking thirteen...")
    
def test_tc5():
    """Nick posts a text using his token. """
    nick.make_post("Nick's post", "I've seen ... attack ships on fire off the shoulder of Orion ... C-beams glitter in the dark near the Tannhäuser Gate")

def test_tc6():
    """Mary posts a text using her token. """
    mary.make_post("Mary's post", "HUMANS NEED FANTASY TO BE HUMAN. TO BE THE PLACE WHERE THE FALLING ANGEL MEETS THE RISING APE.")

def test_tc7():
    """Nick and Olga browse available posts in chronological order in the MiniWall; 
    there should be three posts available. Note, that we don't have any likes yet. """
    nick.browse_posts(expected_order=["Olga's post","Nick's post", "Mary's post" ])
    olga.browse_posts(expected_order=["Olga's post","Nick's post", "Mary's post" ])

def test_tc8():
    """Nick and Olga comment Mary's post in a round-robin fashion (one after the other)."""
    nick.add_comment(
        post_id = mary.post_id, 
        comment = 'Mary - why is this all in capitals?',
        expected_comment_number=0)

    olga.add_comment(
        post_id = mary.post_id,
        comment = """ 
            It's a quote from the character Death in Terry Pratchett's Disworld - he always speaks in capitals.
            Also why did you ask Mary? You know she can't reply to her own post! 
            This is a stupid social network, I'm moving to mastodon.
            """,
        expected_comment_number=1)

def test_tc9():
    """Mary comments her post. This call should be unsuccessful; an owner cannot comment owned posts. """
    mary.add_comment(
        post_id = mary.post_id,
        comment = """ 
            Actually I CAN reply because the idiot developing this app hasn't coded it in yet, 
            despite the fact he's writing this test. He said something about "test driven development", 
            but I think he's just procrastinating by writing stupid conversations between imaginary people.
            """, 
            # Test passes - who looks stupid now Mary?
        access_expected=False)

def test_tc10():
    """ Mary can see posts in a chronological order (newest posts are on the top as there are no likes yet). """
    mary.browse_posts(expected_order=["Olga's post","Nick's post", "Mary's post" ])

def test_tc11():
    """ Mary can see the comments for her posts. """
    expected_commenters = {
        0 : nick.id,
        1: olga.id
    }
    mary.view_user_comments(expected_commenters = expected_commenters)

def test_tc12():
    """ Nick and Olga like Mary's posts"""
    nick.like_post(mary.post_id, expected_likes=1)
    olga.like_post(mary.post_id, expected_likes=2)

def test_tc13():
    """ Mary likes her posts. This call should be unsuccessful; an owner cannot like their posts. """
    mary.like_post(mary.post_id, access_expected=False)


def test_tc14():
    """ Mary can see that there are two likes in her posts. """
    mary.get_user_likes(expected_likes=2)


def test_tc15():
    """ Nick can see the list of posts, since Mary's post has two likes it is shown at the top."""
    nick.browse_posts(expected_order=["Mary's post", "Olga's post","Nick's post" ])

