from flask import Flask
from flask.ext.mongoengine import MongoEngine
from flask.ext.bcrypt import Bcrypt
from flask.ext.login import LoginManager

app = Flask(__name__)
login_manager = LoginManager()
login_manager.init_app(app)
app.config["MONGODB_SETTINGS"] = {'DB': "woe_main"}
app.config["SECRET_KEY"] = "woe"

db = MongoEngine(app)
bcrypt = Bcrypt(app)

import views.core
import views.topics

if __name__ == '__main__':
    app.run()
