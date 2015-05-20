import MySQLdb
import MySQLdb.cursors
from woe.models.forum import Category
from slugify import slugify

def import_categories(parent=-1):
    exclude = [14,]
    db = MySQLdb.connect(user="root", db="woe", cursorclass=MySQLdb.cursors.DictCursor,charset='latin1',use_unicode=True)
    cursor=db.cursor()
    cursor.execute("select * from ipsforums where parent_id=%s;", [parent,])
    c = cursor.fetchall()
    
    for cat in c:
        category = Category()
        category.name = cat["name"].encode("latin1")
        category.slug = slugify(cat["name"].encode("latin1").strip().lower().replace(" ", "-"), max_length=100, word_boundary=True, save_order=True)
        
        if parent == -1:
            category.root_category = True
        else:
            category.root_category = False
            category.parent = Category.objects(old_ipb_id=parent)[0]
        
        category.old_ipb_id = cat["id"]
        category.weight = cat["position"]
        if category.old_ipb_id not in exclude:
            category.save()
            import_categories(parent=category.old_ipb_id)
    
    cursor.close()
        
import_categories()