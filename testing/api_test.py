import pytest
import requests
from typing import Callable
from requests import Response
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

ACCOUNT_URL = BASE_URL + 'account/'
REGISTER_URL = ACCOUNT_URL + 'register'
LOGIN_URL = ACCOUNT_URL + 'login'

WALL_URL = BASE_URL + 'wall/'
POST_URL = WALL_URL + 'post/'
COMMENT_URL = POST_URL + 'comment/'
LIKE_URL = POST_URL + 'like/'
ENGAGEMENT_SUMMARY = WALL_URL + 'summary/engagement_summary'



class User:
    id: str
    post_id: str
    token: str

    register_response: Response
    token_response: Response
    post_response: Response
    comment_response: Response
    like_response: Response

    post_text: str
    post_id: str


    def __init__(self, username, password):
        self.username = username
        self.password = password


@pytest.fixture
def clear_db():
    'Clear database before test'
    yield
    for collection in client.social_life.list_collection_names():
        client.social_life.drop_collection(collection)
    

@pytest.fixture
def create_users(clear_db):
    olga = User('olga01', 'olga_pass')
    nick = User('nick01', 'nick_pass')
    mary = User('mary01', 'mary_pass')
    return olga, nick, mary
    

@pytest.fixture
def register_users( create_users: tuple[User, User, User]):
    users = create_users
    for user in users:
        response = requests.post(
            REGISTER_URL, 
            json = {
                'username': user.username,
                'password': user.password
            }
        )
        user.id = response.json()['_id']
        user.register_response = response
    return users
    
@pytest.fixture
def get_user_tokens(register_users: tuple[User, User, User]):
    for user in register_users:
        response = requests.post(
            LOGIN_URL, 
            json = {
                'username': user.username,
                'password': user.password
            }
        )
        user.token_response = response
        user.token = response.json()['auth_token']
    return register_users


@pytest.fixture
def make_posts(get_user_tokens: tuple[User, User, User]):
    olga, nick, mary = get_user_tokens

    olga.post_title = "Olga's post"
    olga.post_text = "It was a bright, cold day in April and the clocks were striking thirteen..."

    nick.post_title = "Nick's post"
    nick.post_text = "I've seen ... attack ships on fire off the shoulder of Orion ... C-beams glitter in the dark near the Tannhäuser Gate"
    
    mary.post_title = "Mary's post"
    mary.post_text = "HUMANS NEED FANTASY TO BE HUMAN. TO BE THE PLACE WHERE THE FALLING ANGEL MEETS THE RISING APE."

    for user in olga, nick, mary:
        response = requests.post(
            POST_URL,
            json = {
                'title': user.post_title,
                'text': user.post_text
            },
            headers = {'auth-token': user.token}
        )
        user.post_response = response
        user.post_id = response.json()['_id']

    return olga, nick, mary 

@pytest.fixture
def users_with_posts_and_comments(make_posts: tuple[User, User, User]):
    olga, nick, mary = make_posts

    nick.comment = 'Mary - why is this all in capitals?'

    olga.comment = """ 
        It's a quote from the character Death in Terry Pratchett's Disworld.
        Also why did you ask Mary? You know she can't reply to her own post!
        """

    mary.comment = """ 
        Actually I CAN reply because the idiot developing this app hasn't finished coding it yet. 
        He said something about "test driven development".
        """

    for user in nick, olga, mary:
        response = requests.post(
            COMMENT_URL,
            json = {
                'postId': mary.post_id,
                'comment' : user.comment
            },
            headers = {'auth-token': user.token}
        )
        user.comment_response = response
    
    return olga, nick, mary

@pytest.fixture
def users_with_posts_comments_likes( users_with_posts_and_comments: tuple[User, User, User] ):
    olga, nick, mary = users_with_posts_and_comments
    for user in nick, olga, mary:
        response = requests.post(
                LIKE_URL,
                json = {
                    'postId':  mary.post_id
                },
                headers = {'auth-token': user.token}
            )
        user.like_response = response
    return olga, nick, mary
        

### TEST CASES FROM SPECIFICATION ###

def test_tc1( register_users: tuple[User, User, User]): 
    '''
    TC 1. Olga, Nick and Mary register in the application and access the API. 
    '''
    for user in register_users:
        assert user.register_response.ok
        assert user.register_response.json()['username'] == user.username
        assert user.register_response.json()['password'] != user.password


def test_tc2(get_user_tokens:  tuple[User, User, User]):
    '''
    TC 2. Olga, Nick and Mary will use the oAuth v2 authorisation service to get their tokens.
    '''
    for user in get_user_tokens:
        assert user.token_response.ok


def test_tc3(get_user_tokens):
    """Olga calls the API (any endpoint) without using a token. 
    This call should be unsuccessful as the user is unauthorised."""

    response = requests.get(
            WALL_URL
        )
    assert not response.ok


def is_post_created(user: User):
    response = user.post_response 
    assert response.ok
    post = response.json()
    assert post['title'] == user.post_title
    assert post['text'] == user.post_text
    assert post['owner'] == user.id
    assert post['timestamp'] is not None
    assert post['comments'] == []
    assert post['likes'] == 0


def test_tc4(make_posts: tuple[User, User, User]):
    """Olga posts a text using her token. """
    olga, _, _ = make_posts
    is_post_created(olga)
        
def test_tc5( make_posts):
    """Nick posts a text using his token. """
    _, nick, _ = make_posts
    is_post_created(nick)

def test_tc6( make_posts):
    """Mary posts a text using her token. """
    _, _, mary = make_posts
    is_post_created(mary)



def test_tc7(make_posts: tuple[User, User, User]):
    """Nick and Olga browse available posts in chronological order in the MiniWall; 
    there should be three posts available. Note, that we don't have any likes yet. """
    olga, nick, _ = make_posts
    for user in nick, olga:
        response = requests.get(
            WALL_URL,
            headers = {'auth-token': user.token}
            )
        assert response.ok
        posts =  response.json()
        titles = [post['title'] for post in posts]
        assert titles == ["Olga's post","Nick's post", "Mary's post" ]


def test_tc8(users_with_posts_and_comments: tuple[User, User, User] ):
    """Nick and Olga comment Mary's post in a round-robin fashion (one after the other)."""

    olga, nick, mary = users_with_posts_and_comments
    print(olga.username)

    for i, user in enumerate([nick, olga]):
        print(user.comment_response)
        assert user.comment_response.ok
        updated_post = user.comment_response.json()
        assert updated_post['_id'] == mary.post_id
        assert updated_post['comments'][i]['comment'] == user.comment
        assert updated_post['comments'][i]['owner_id'] == user.id
    

def test_tc9(users_with_posts_and_comments: tuple[User, User, User]):
    """Mary comments her post. This call should be unsuccessful; an owner cannot comment owned posts. """
    _ , _, mary = users_with_posts_and_comments
    assert not mary.comment_response.ok


def test_tc10(users_with_posts_and_comments: tuple[User, User, User]):
    """ Mary can see posts in a chronological order (newest posts are on the top as there are no likes yet). """
    _ , _, mary = users_with_posts_and_comments
    response = requests.get(
            WALL_URL,
            headers = {'auth-token': mary.token}
            )
    assert response.ok
    posts =  response.json()
    titles = [post['title'] for post in posts]
    assert titles == ["Olga's post","Nick's post", "Mary's post" ]


def test_tc11(users_with_posts_and_comments: tuple[User, User, User]):
    """ Mary can see the comments for her posts. """
    olga , nick , mary = users_with_posts_and_comments
    response = requests.get(
            WALL_URL,
            headers = {'auth-token': mary.token}
            )
    assert response.ok
    comments = response.json()[2]['comments']
    assert comments[0]['owner_id'] == nick.id
    assert comments[1]['owner_id'] == olga.id


def test_tc12(users_with_posts_comments_likes: tuple[User, User, User]):
    """ Nick and Olga like Mary's posts"""

    olga, nick, _ = users_with_posts_comments_likes
    for i, user in enumerate([nick, olga]):
        response = user.like_response
        assert response.ok
        post = response.json()
        assert post['likes'] == i + 1

        
def test_tc13(users_with_posts_comments_likes: tuple[User, User, User]):
    """ Mary likes her posts. This call should be unsuccessful; an owner cannot like their posts. """
    _, _, mary = users_with_posts_comments_likes
    assert not mary.like_response.ok


def test_tc14(users_with_posts_comments_likes: tuple[User, User, User]):
    """ Mary can see that there are two likes in her posts. """
    _, _, mary = users_with_posts_comments_likes
    response = requests.get(
            ENGAGEMENT_SUMMARY,
            headers = {'auth-token': mary.token}
        )
    assert response.ok
    assert response.json()['likes'] == 2


def test_tc15(users_with_posts_comments_likes: tuple[User, User, User]):
    """ Nick can see the list of posts, since Mary's post has two likes it is shown at the top."""
    nick, _, _ = users_with_posts_comments_likes
    response = requests.get(
            WALL_URL,
            headers = {'auth-token': nick.token}
            )
    assert response.ok
    posts =  response.json()
    titles = [post['title'] for post in posts]
    assert titles == ["Mary's post" , "Olga's post","Nick's post" ]




### CRUD TESTS ###

def test_post_delete(make_posts: tuple[User, User, User]):
    '''Can we delete a post?'''
    _, nick, _ = make_posts
    response = requests.delete(
            f'{POST_URL}/{nick.post_id}',  
            headers = {'auth-token': nick.token}


        )

    assert response.ok

    get_response = requests.get(
            WALL_URL, 
            headers = {'auth-token': nick.token}
        )

    assert len(get_response.json()) == 2


def test_post_delete_no_access(make_posts: tuple[User, User, User]):
    '''User should not be able to delete other user's post'''
    _, nick, mary = make_posts
    response = requests.delete(
            f'{POST_URL}/{mary.post_id}',  
            headers = {'auth-token': nick.token}
        )
    assert not response.ok
    get_response = requests.get(
            WALL_URL, 
            headers = {'auth-token': nick.token}
        )

    assert len(get_response.json()) == 3


def test_post_edit(make_posts: tuple[User, User, User]):
    '''User should not be able to delete other user's post'''
    _, nick, _ = make_posts
    response = requests.patch(
            f'{POST_URL}/{nick.post_id}', 
            json = {
                'text': 'test',
                'title': 'test'
            },
            headers = {'auth-token': nick.token}
        )
    assert response.ok
    get_response = requests.get(
            f'{POST_URL}/{nick.post_id}', 
            headers = {'auth-token': nick.token}
        )

    assert  get_response.json()['text'] == 'test'
    assert  get_response.json()['title'] == 'test'




#### VALIDATION TEST ###

def invalid_register_test(username, password):
    response = requests.post(
                REGISTER_URL, 
                json = {
                    'username': username,
                    'password': password
                }
            )
    assert not response.ok


def test_validation_password_length(clear_db):
    '''Password must be at least 8 characters'''
    invalid_register_test(username= 'test', password= '1234567')
    

def test_validation_username_length(clear_db):
    '''Username must be 100 characters or less'''
    invalid_register_test(
        username= 'abcdefghijklmnopqrstuvwxyabcdefghijklmnopqrstuvwxyabcdefghijklmnopqrstuvwxyabcdefghijklmnopqrstuvwxyzasdfas', 
        password= '12345678')
        

def test_validation_username_no_spaces(clear_db):
    '''Username cannot have spaces'''
    invalid_register_test(
        username= 'test username', 
        password= '12345678')


def test_validation_username_unique(register_users):
    '''Username must be unique'''
    invalid_register_test(
        username= 'olga01', 
        password= '12345678')

    



def test_validation_post_length_short(get_user_tokens: tuple[User, User, User]):
    ''' Post length must be greater than 0 '''
    olga, _, _ = get_user_tokens
    response = requests.post(
            POST_URL,
            json = {
                'title': 'test',
                'text': ''
            },
            headers = {'auth-token': olga.token}
        )
    assert not response.ok

def test_validation_post_length_long(get_user_tokens: tuple[User, User, User]):
    ''' Max post length 256 characters '''
    olga, _, _ = get_user_tokens
    response = requests.post(
            POST_URL,
            json = {
                'title': 'test',
                'text': '''
                This is a post that is too long because it is over 256 characters. 
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do ei
                usmod tempor incididunt ut labore et dolore magna aliqua. Ut enim 
                ad minim veniam, quis nostrud exercitation ullamco laboris dolor
                '''
            },
            headers = {'auth-token': olga.token}
        )
    assert not response.ok


def test_validation_title_length_short(get_user_tokens: tuple[User, User, User]):
    ''' Title length must be > 0 '''
    olga, _, _ = get_user_tokens
    response = requests.post(
            POST_URL,
            json = {
                'title': '',
                'text': 'test'
            },
            headers = {'auth-token': olga.token}
        )
    assert not response.ok


def test_validation_title_length_long(get_user_tokens: tuple[User, User, User]):
    ''' Max title length 128 characters '''
    olga, _, _ = get_user_tokens
    response = requests.post(
            POST_URL,
            json = {
                'title': '''
                    This is a post title that is too long because it is over 128 characters. 
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do ei
                    ''',
                'text': 'test'
            },
            headers = {'auth-token': olga.token}
        )
    assert not response.ok



def test_validation_comment_length_short(make_posts:tuple[User, User, User]):
    ''' Comment must be greater than 0'''
    _, nick, mary = make_posts

    response = requests.post(
            COMMENT_URL,
            json = {
                'postId': mary.post_id,
                'comment' : ''
            },
            headers = {'auth-token': nick.token}
        )
    assert not response.ok

def test_validation_comment_length_long(make_posts:tuple[User, User, User]):
    ''' Comment must be <= 256 characters'''
    _, nick, mary = make_posts

    response = requests.post(
            COMMENT_URL,
            json = {
                'postId': mary.post_id,
                'comment' : '''
                    This is a comment that is too long because it is over 256 characters. 
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do ei
                    usmod tempor incididunt ut labore et dolore magna aliqua. Ut enim 
                    ad minim veniam, quis nostrud exercitation ullamco laboris dolor
                    '''
            },
            headers = {'auth-token': nick.token}
        )
    assert not response.ok


