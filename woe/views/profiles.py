from woe.models.core import User
from woe.forms.core import AvatarTitleForm, DisplayNamePasswordForm
from woe import app
from flask import abort, redirect, url_for, request, render_template, make_response, json, flash
from flask.ext.login import login_required, current_user
from werkzeug import secure_filename
import os
import arrow

@app.route('/member/<login_name>')
@login_required
def view_profile(login_name):
    try:
        user = User.objects(login_name=login_name.strip().lower())[0]
    except IndexError:
        abort(404)
    return render_template("profile.jade", profile=user)
    
@app.route('/member/<login_name>/change-avatar-title', methods=['GET', 'POST'])
@login_required
def change_avatar_or_title(login_name):
    try:
        user = User.objects(login_name=login_name.strip().lower())[0]
    except IndexError:
        abort(404)
        
    if current_user != user and not current_user.is_staff:
        abort(404)
    
    form = AvatarTitleForm(csrf_enabled=False)
    
    if form.validate_on_submit():
        if form.avatar.data:
            timestamp = str(arrow.utcnow().timestamp) + "_"
            
            if user.avatar_extension:
                try:
                    os.remove(os.path.join(app.config["AVATAR_UPLOAD_DIR"],user.avatar_timestamp + str(user.pk) + user.avatar_extension))
                    os.remove(os.path.join(app.config["AVATAR_UPLOAD_DIR"],user.avatar_timestamp + str(user.pk) + "_40" + user.avatar_extension))
                    os.remove(os.path.join(app.config["AVATAR_UPLOAD_DIR"],user.avatar_timestamp + str(user.pk) + "_60" + user.avatar_extension))
                except OSError:
                    pass
            
            extension = "." + form.avatar.data.filename.split(".")[-1].lower()
            if form.gif == True:
                form.avatar.data.seek(0)
                form.avatar.data.save(os.path.join(app.config["AVATAR_UPLOAD_DIR"],timestamp + str(user.pk) + extension))
            else:
                form.avatar_image.save(os.path.join(app.config["AVATAR_UPLOAD_DIR"],timestamp + str(user.pk) + extension))
            
            form.fourty_image.save(os.path.join(app.config["AVATAR_UPLOAD_DIR"],timestamp + str(user.pk) + "_40" + extension))
            form.sixty_image.save(os.path.join(app.config["AVATAR_UPLOAD_DIR"],timestamp + str(user.pk) + "_60" + extension))
            
            user.avatar_extension = extension
            user.avatar_timestamp = timestamp
            user.avatar_full_x, user.avatar_full_y = form.avatar_image.size
            user.avatar_40_x, user.avatar_40_y = form.fourty_image.size
            user.avatar_60_x, user.avatar_60_y = form.sixty_image.size
        user.title = form.title.data
        user.save()
        return redirect("/member/"+user.login_name)
    else:
        filename = None
        form.title.data = user.title
    
    return render_template("profile/change_avatar.jade", profile=user, form=form)

@app.route('/member/<login_name>/change-account', methods=['GET', 'POST'])
@login_required
def change_display_name_password(login_name):
    try:
        user = User.objects(login_name=login_name.strip().lower())[0]
    except IndexError:
        abort(404)
        
    if current_user != user and not current_user.is_staff:
        abort(404)
        
    form = DisplayNamePasswordForm(csrf_enabled=False)
    form.user_object = user
    form.current_user = current_user
    
    if form.validate_on_submit():
        if form.new_password.data != "":
            user.set_password(form.new_password.data)
            
        if form.display_name.data != user.display_name:
            user.display_name = form.display_name.data
            
        if form.email != user.email_address:
            user.email_address = form.email.data
        
        user.save()
        
        return redirect("/member/"+user.login_name)
    else:
        form.display_name.data = user.display_name
        form.email.data = user.email_address
        
    return render_template("profile/change_account.jade", profile=user, form=form)

@app.route('/member/<login_name>/remove-avatar', methods=['POST'])
@login_required
def remove_avatar(login_name):
    try:
        user = User.objects(login_name=login_name.strip().lower())[0]
    except IndexError:
        abort(404)
        
    if current_user != user and not current_user.is_staff:
        abort(404)
    try:
        os.remove(os.path.join(app.config["AVATAR_UPLOAD_DIR"],user.avatar_timestamp + str(user.pk) + user.avatar_extension))
        os.remove(os.path.join(app.config["AVATAR_UPLOAD_DIR"],user.avatar_timestamp + str(user.pk) + "_40" + user.avatar_extension))
        os.remove(os.path.join(app.config["AVATAR_UPLOAD_DIR"],user.avatar_timestamp + str(user.pk) + "_60" + user.avatar_extension))
    except OSError:
        pass
    user.avatar_extension = None
    user.avatar_timestamp = ""
    user.save()
    return redirect("/member/"+user.login_name)