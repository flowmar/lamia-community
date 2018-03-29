from woe import app
from flask import abort, redirect, url_for, request, render_template, make_response, json, flash
from flask.ext.login import login_required, current_user
import flask_admin as admin
from flask_admin import helpers, expose, BaseView
from flask_admin.contrib.sqla import ModelView
from flask_admin.contrib.sqla.ajax import QueryAjaxModelLoader
from woe import sqla
import woe.sqlmodels as sqlm
from jinja2 import Markup
import arrow
from woe.utilities import humanize_time, ForumHTMLCleaner
from woe.parsers import ForumPostParser
_base_url = app.config['BASE']


from sqlalchemy import or_

from flask.ext.admin._compat import as_unicode, string_types
from flask.ext.admin.model.ajax import AjaxModelLoader, DEFAULT_PAGE_SIZE

class StartsWithQueryAjaxModelLoader(QueryAjaxModelLoader):
    def get_list(self, term, offset=0, limit=DEFAULT_PAGE_SIZE):
        query = self.session.query(self.model)

        filters = (field.startswith(u'%s' % term) for field in self._cached_fields)
        query = query.filter(or_(*filters))

        return query.offset(offset).limit(limit).all()

class AuthAdminIndexView(admin.AdminIndexView):
    @expose('/')
    def index(self):
        if not current_user.is_mod and not current_user.is_admin:
            return redirect("/")
            
        all_active_reports = sqlm.Report.query.filter(sqlm.Report.status.in_(["open", "feedback", "waiting"])).count()
        recent_infractions = sqlm.Infraction.query.filter(sqlm.Infraction.created > arrow.utcnow().replace(days=-7).datetime).count()
        active_bans = sqlm.Ban.query.filter_by(forever=False).filter(sqlm.Ban.expires > arrow.utcnow().datetime).count()
            
        if current_user.is_admin:
            my_area_reports = all_active_reports
        else:
            my_area_reports = sqlm.Report.query.filter(
                    sqlm.Report.status.in_(["open", "feedback", "waiting"]),
                    sqlm.Report.report_area.in_(current_user.get_modded_areas())
                ).count()
        
        return self.render('admin/index.html', 
                all_active_reports=all_active_reports,
                recent_infractions=recent_infractions,
                active_bans=active_bans,
                my_area_reports=my_area_reports
            )
admin = admin.Admin(app, index_view=AuthAdminIndexView(), name="Staff CP")

def _user_list_formatter(view, context, model, name):
    user = getattr(model, name)
    prettified_user = \
    u"""<div><a href="/member/%s"><img src="%s" width="%spx" height="%spx" class="avatar-mini" style="margin-right: 15px;"/></a><a class="hover_user" href="/member/%s">%s</a></div>""" \
        % (unicode(user.my_url),
        user.get_avatar_url("40"),
        user.avatar_40_x,
        user.avatar_40_y,
        unicode(user.my_url),
        unicode(user.display_name))
        
    return Markup(prettified_user)
    
def _unslugify_formatter(view, context, model, name):
    field = getattr(model, name)
    return field.replace("-", " ").title()

def _report_status_formatter(view, context, model, name):
    status = getattr(model, name)
    _template = "<div style=\"font-size: 1.25em; font-weight: bold; color: %s;\"><i class=\"%s\"></i>&nbsp;%s</div>"
    formats = {
        "ignored": ("black", "far fa-times-circle","Ignored",),
        "open": ("#800000", "far fa-circle","Open",),
        "feedback": ("#804d00", "far fa-question-circle","Feedback Requested",),
        "waiting": ("#000080", "far fa-clock","Waiting",),
        "actiontaken": ("#008000", "far fa-check-circle","Done",),
        "working": ("#660080", "far fa-play-circle","Working",)
    }
    return Markup(_template % formats[status])
    
def _age_from_time_formatter(view, context, model, name):
    time = arrow.get(getattr(model, name))
    now = arrow.utcnow()
    
    age = (now - time).days
    if age < 1:
        return "Today"
        
    return "%s days old" % (age, )

def _null_number_formatter(view, context, model, name):
    number = getattr(model, name)
    if not number:
        return 0
    else:
        return number
        
def _fancy_time_formatter(view, context, model, name):
    time = getattr(model, name)
    return humanize_time(time)

def _fancy_time_formatter_for_expirations(view, context, model, name):
    time = getattr(model, name)
    if time:
        return humanize_time(time)
    else:
        return "Never"

def _content_formatter(view, context, model, name):
    _html = getattr(model, name)
    
    clean_html_parser = ForumPostParser()
    return Markup(clean_html_parser.parse(_html).replace("parsed\"", "parsed\" style=\"max-height: 300px; overflow-y: scroll;\""))

class MyReportView(ModelView):
    can_view_details = True
    can_edit = False
    can_create = False
    can_delete = False
    column_default_sort = ('created', False)
    details_template = 'admin/model/report_details.html'
    column_list = ["status", "report_area", "created", "report_comment_count", "report_last_updated", "content_author"]
    column_details_list = [
        "report_area", "created", "status", "report_author", "content_author",
        "report_message", "reported_content_html"
    ]
    column_labels = dict(content_author="Defendent", report_author="Accuser", created="Report Age",
        report_comment_count="Comments", report_last_updated="Last Updated", reported_content_html="Reported Content")
    # TODO - unhardcode these urls
    extra_css = ["/static/assets/datatables/dataTables.bootstrap.css",
        "/static/assets/datatables/dataTables.responsive.css"
        ]
    extra_js = ["/static/assets/datatables/js/jquery.dataTables.min.js", 
        "/static/assets/datatables/dataTables.bootstrap.js",
        "/static/assets/datatables/dataTables.responsive.js"
        ]
    
    column_formatters = {
        'report_author': _user_list_formatter,
        'content_author': _user_list_formatter,
        'report_area': _unslugify_formatter,
        'status': _report_status_formatter,
        'created': _age_from_time_formatter,
        'report_comment_count': _null_number_formatter,
        'report_last_updated': _fancy_time_formatter,
        'reported_content_html': _content_formatter
    }
    
    def is_accessible(self):
        return current_user.is_admin or current_user.is_mod
    
    def get_query(self):
        if current_user.is_admin:
            return self.session.query(self.model).filter(
                                self.model.status.in_(["open", "feedback", "waiting", "working"]),
                            )
        else:
            return self.session.query(self.model).filter(
                                self.model.status.in_(["open", "feedback", "waiting", "working"]),
                                self.model.report_area.in_(current_user.get_modded_areas())
                            )
    
    def get_count_query(self):
        if current_user.is_admin:
            return self.session.query(sqla.func.count('*')).select_from(self.model).filter(
                                self.model.status.in_(["open", "feedback", "waiting", "working"]),
                            )
        else:
            return self.session.query(sqla.func.count('*')).select_from(self.model).filter(
                                self.model.status.in_(["open", "feedback", "waiting", "working"]),
                                self.model.report_area.in_(current_user.get_modded_areas())
                            )
                            
class ReportArchiveView(MyReportView):  
    column_default_sort = ('report_last_updated', False)
      
    def get_query(self):
        if current_user.is_admin:
            return self.session.query(self.model).filter(
                                sqla.not_(self.model.status.in_(["open", "feedback", "waiting", "working"])),
                            )
        else:
            return self.session.query(self.model).filter(
                                sqla.not_(self.model.status.in_(["open", "feedback", "waiting", "working"])),
                                self.model.report_area.in_(current_user.get_modded_areas())
                            )
    
    def get_count_query(self):
        if current_user.is_admin:
            return self.session.query(sqla.func.count('*')).select_from(self.model).filter(
                                sqla.not_(self.model.status.in_(["open", "feedback", "waiting", "working"])),
                            )
        else:
            return self.session.query(sqla.func.count('*')).select_from(self.model).filter(
                                sqla.not_(self.model.status.in_(["open", "feedback", "waiting", "working"])),
                                self.model.report_area.in_(current_user.get_modded_areas())
                            )
                            
class AllOpenReportsView(MyReportView):    
    def get_query(self):
        return self.session.query(self.model).filter(
                            self.model.status.in_(["open", "feedback", "waiting", "working"]),
                        )
    
    def get_count_query(self):
        return self.session.query(sqla.func.count('*')).select_from(self.model).filter(
                            self.model.status.in_(["open", "feedback", "waiting", "working"]),
                        )
             
class ReportActionView(BaseView):
    def is_visible(self):
        return False
        
    @expose('/')
    def index(self):
        return ""
        
    @expose('/new-comment/<idx>', methods=('POST', ))
    def add_comment(self, idx):
        _model = sqlm.Report.query.filter_by(id=idx)[0]
        
        if not current_user.is_admin and not current_user.is_mod:
            return abort(404)
        
        request_json = request.get_json(force=True)

        if request_json.get("text", "").strip() == "":
            return app.jsonify(no_content=True)
        
        cleaner = ForumHTMLCleaner()
        try:
            post_html = cleaner.clean(request_json.get("post", ""))
        except:
            return abort(500)
        
        _comment = sqlm.ReportComment(
                created = arrow.utcnow().datetime.replace(tzinfo=None),
                comment = post_html,
                is_status_change = False,
                author = current_user,
                report = _model
            )
        
        _model.report_last_updated = arrow.utcnow().datetime.replace(tzinfo=None)
        _model.report_comment_count = sqla.session.query(sqla.func.count('*')).select_from(sqlm.ReportComment) \
                .filter_by(report=_model, is_status_change=False)
        
        sqla.session.add(_comment)
        sqla.session.add(_model)
        sqla.session.commit()
        
        return app.jsonify(success=True)
        
    @expose('/mark-<status>/<idx>', methods=('POST', ))
    def mark_done(self, idx, status):
        _model = sqlm.Report.query.filter_by(id=idx)[0]
        
        if not current_user.is_admin and not _model.report_area in current_user.get_modded_areas():
            return abort(404)
            
        if not status in [sc[0] for sc in sqlm.Report.STATUS_CHOICES]:
            return abort(404)
        
        _fancy_status_names = dict((x, y) for x, y in sqlm.Report.STATUS_CHOICES)
        
        old_status = _model.status
        _model.report_last_updated = arrow.utcnow().datetime.replace(tzinfo=None)
        _model.status = status
        _new_status = _fancy_status_names[status]
        _old_status = _fancy_status_names[old_status]
        
        if status in ["actiontaken", "ignored"] and not old_status in ["actiontaken", "ignored"]:
            _model.resolved = arrow.utcnow().datetime.replace(tzinfo=None)
            _model.mark_as_resolved_by = current_user
        
        sqla.session.add(_model)
        sqla.session.commit()
        
        _comment = sqlm.ReportComment(
                created = arrow.utcnow().datetime.replace(tzinfo=None),
                comment = "changed status from \"%s\" to \"%s\"" % (_old_status, _new_status),
                is_status_change = True,
                author = current_user,
                report = _model
            )
        
        sqla.session.add(_comment)
        sqla.session.commit()
        
        return "ok"
    
admin.add_view(ReportActionView(endpoint='report', name="Report Utilities"))
admin.add_view(MyReportView(sqlm.Report, sqla.session, name='Open in My Area', category="Reports", endpoint='my-reports'))
admin.add_view(AllOpenReportsView(sqlm.Report, sqla.session, name='All Open Reports', category="Reports", endpoint='all-reports'))
admin.add_view(ReportArchiveView(sqlm.Report, sqla.session, name='Archived Reports', category="Reports", endpoint='report-archive'))

class InfractionView(ModelView):
    can_view_details = True
    can_delete = False
    column_default_sort = ('created', True)
    column_list = ["title", "author", "recipient", "points", "created", "expires"]
    
    form_ajax_refs = {
        'author': StartsWithQueryAjaxModelLoader('author', sqla.session, sqlm.User, fields=['display_name',], page_size=10),
        'recipient': StartsWithQueryAjaxModelLoader('recipient', sqla.session, sqlm.User, fields=['display_name',], page_size=10),
        'deleted_by': StartsWithQueryAjaxModelLoader('deleted_by', sqla.session, sqlm.User, fields=['display_name',], page_size=10)
    }
    column_formatters = {
            'author': _user_list_formatter,
            'recipient': _user_list_formatter,
            'created': _age_from_time_formatter,
            'expires': _fancy_time_formatter_for_expirations
        }
    extra_css = ["/static/assets/datatables/dataTables.bootstrap.css",
        "/static/assets/datatables/dataTables.responsive.css"
        ]
    extra_js = ["/static/assets/datatables/js/jquery.dataTables.min.js",
        "/static/assets/datatables/dataTables.bootstrap.js",
        "/static/assets/datatables/dataTables.responsive.js"
        ]
        
    def is_accessible(self):
        if not current_user.is_admin:
            self.can_edit = False
            self.can_create = False
            
        return current_user.is_admin or current_user.is_mod

class MostWanted(ModelView):
    can_view_details = True
    can_delete = False
    can_edit = False
    can_create = False
    column_default_sort = ('lifetime_infraction_points', True)
    column_list = ["display_name", "lifetime_infraction_points", "banned"]
    
    extra_css = ["/static/assets/datatables/dataTables.bootstrap.css",
        "/static/assets/datatables/dataTables.responsive.css"
        ]
    extra_js = ["/static/assets/datatables/js/jquery.dataTables.min.js",
        "/static/assets/datatables/dataTables.bootstrap.js",
        "/static/assets/datatables/dataTables.responsive.js"
        ]
        
    def get_query(self):
        return self.session.query(self.model).filter_by(banned=False) \
            .filter(self.model.lifetime_infraction_points > 0)
    
    def get_count_query(self):
        return self.session.query(sqla.func.count('*')).select_from(self.model).filter_by(banned=False) \
            .filter(self.model.lifetime_infraction_points > 0)
        
    def is_accessible(self):
        return current_user.is_admin or current_user.is_mod
        
class CurrentInfractions(MostWanted):
    column_default_sort = ('active_infraction_points', True)
    column_list = ["display_name", "active_infraction_points", "banned"]
        
    def get_query(self):
        return self.session.query(self.model).filter_by(banned=False) \
            .filter(self.model.active_infraction_points > 0)
    
    def get_count_query(self):
        return self.session.query(sqla.func.count('*')).select_from(self.model).filter_by(banned=False) \
            .filter(self.model.active_infraction_points > 0)

admin.add_view(InfractionView(sqlm.Infraction, sqla.session, name='Infraction Log', category="Infractions", endpoint='infractions'))
admin.add_view(CurrentInfractions(sqlm.User, sqla.session, name='Active Infractions', category="Infractions", endpoint='active-infractions'))
admin.add_view(MostWanted(sqlm.User, sqla.session, name='Most Infracted', category="Infractions", endpoint='most-infractions'))

class BanView(ModelView):
    can_view_details = True
    can_delete = False
    column_default_sort = ('created', True)
    column_list = ["recipient", "explanation", "created", "expires"]
    
    form_ajax_refs = {
        'recipient': StartsWithQueryAjaxModelLoader('recipient', sqla.session, sqlm.User, fields=['display_name',], page_size=10),
    }
    column_formatters = {
            'recipient': _user_list_formatter,
            'created': _age_from_time_formatter,
            'expires': _fancy_time_formatter_for_expirations
        }
    extra_css = ["/static/assets/datatables/dataTables.bootstrap.css",
        "/static/assets/datatables/dataTables.responsive.css"
        ]
    extra_js = ["/static/assets/datatables/js/jquery.dataTables.min.js",
        "/static/assets/datatables/dataTables.bootstrap.js",
        "/static/assets/datatables/dataTables.responsive.js"
        ]
        
    def is_accessible(self):
        if not current_user.is_admin:
            self.can_edit = False
            self.can_create = False
            
        return current_user.is_admin or current_user.is_mod

admin.add_view(BanView(sqlm.Ban, sqla.session, name='Recent Bans', category="Bans", endpoint='recent-bans'))

# If default settings don't exist, then create them
def check_setting(hierarchy, key, default_value, option_type, meta):
    try:
        _setting = sqlm.SiteConfiguration.query.filter_by(hierarchy=hierarchy, key=key)[0]
    except IndexError:
        sqla.session.rollback()
        
        try:
            _setting = sqlm.SiteConfiguration(
                    hierarchy=hierarchy,
                    key=key,
                    value=default_value,
                    option_type=option_type,
                    meta=meta
                )
            
            sqla.session.add(_setting)
            sqla.session.commit()
        except:
            sqla.session.rollback()
    
check_setting("core.manual-validation-active", "Manual Validation is Active?", "no", "toggle", {})

class ConfigurationView(ModelView):
    can_delete = False
    edit_modal = True
    can_create = False
    column_list = ["hierarchy","key","value"]
    form_excluded_columns = ["hierarchy","key","meta","option_type"]
    
    extra_css = ["/static/assets/datatables/dataTables.bootstrap.css",
        "/static/assets/datatables/dataTables.responsive.css"
        ]
    extra_js = ["/static/assets/datatables/js/jquery.dataTables.min.js", 
        "/static/assets/datatables/dataTables.bootstrap.js",
        "/static/assets/datatables/dataTables.responsive.js"
        ]
        
admin.add_view(ConfigurationView(sqlm.SiteConfiguration, sqla.session, name='General Options', category="Site Settings", endpoint='configuration'))


# TODO Moderation
# TODO Add ajax view for creating infraction
# TODO Add ajax view for modifying a ban
# TODO Add chart to the front showing reports vs infractions
# TODO Show recent moderation alerts
# TODO Log all moderation actions
# TODO Verify that all front end moderation actions are working
# TODO Add mod actions that are missing
# TODO Add status reply mod actions
# TODO Add code for jump to status reply
# TODO Write burning board status import script