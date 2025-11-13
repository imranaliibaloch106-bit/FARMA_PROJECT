from flask import Flask, render_template, request, redirect, url_for, session, flash
import json
import os
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'farm-management-professional-2024'

class DataManager:
    def __init__(self):
        self.instance_path = 'instance'
        self.data_file = os.path.join(self.instance_path, 'farm_data.json')
        self._ensure_instance_folder()
        self._initialize_data()

    def _ensure_instance_folder(self):
        """Ensure instance folder exists"""
        if not os.path.exists(self.instance_path):
            os.makedirs(self.instance_path)
            print(f"✅ Created instance folder: {self.instance_path}")

    def _initialize_data(self):
        """Initialize data file with default data"""
        if not os.path.exists(self.data_file):
            default_data = {
                'users': [
                    {
                        'id': 1,
                        'username': 'admin',
                        'password': 'admin123',
                        'email': 'admin@farm.com',
                        'role': 'admin',
                        'phone': '03163506',
                        'created_at': '2025-11-12'
                    }
                ],
                'crops': [],
                'blogs': [
                    {
                        'id': 1,
                        'title': 'Welcome to Smart Farming',
                        'content': 'This is the beginning of modern farming with technology.',
                        'author': 'admin',
                        'category': 'Farming Tips',
                        'created_at': '2024-01-01'
                    }
                ],
                'settings': {
                    'app_name': 'SmartFarm Pro',
                    'version': '1.0.0'
                }
            }
            self._save_data(default_data)
            print("✅ Initialized data file with default data")

    def _load_data(self):
        """Load data from JSON file"""
        try:
            with open(self.data_file, 'r') as f:
                data = json.load(f)
                print("✅ Data loaded successfully")
                return data
        except Exception as e:
            print(f"❌ Error loading data: {e}")
            # Return default structure if file is corrupted
            return {'users': [], 'crops': [], 'blogs': [], 'settings': {}}

    def _save_data(self, data):
        """Save data to JSON file"""
        try:
            with open(self.data_file, 'w') as f:
                json.dump(data, f, indent=4)
            print("✅ Data saved successfully")
            return True
        except Exception as e:
            print(f"❌ Error saving data: {e}")
            return False

    # User Management
    def add_user(self, user_data):
        data = self._load_data()
        user_id = len(data['users']) + 1
        user = {
            'id': user_id,
            **user_data,
            'created_at': datetime.now().isoformat()
        }
        data['users'].append(user)
        if self._save_data(data):
            print(f"✅ User added: {user_data['username']}")
            return user
        return None

    def get_user_by_username(self, username):
        data = self._load_data()
        for user in data['users']:
            if user['username'] == username:
                return user
        return None

    def get_all_users(self):
        data = self._load_data()
        return data['users']

    # Crop Management
    def add_crop(self, crop_data):
        data = self._load_data()
        crop_id = len(data['crops']) + 1
        crop = {
            'id': crop_id,
            **crop_data,
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        data['crops'].append(crop)
        if self._save_data(data):
            print(f"✅ Crop added: {crop_data['crop_name']}")
            return crop
        return None

    def get_all_crops(self):
        data = self._load_data()
        return data['crops']

    def get_user_crops(self, username):
        data = self._load_data()
        return [crop for crop in data['crops'] if crop.get('farmer') == username]

    def get_crop_by_id(self, crop_id):
        data = self._load_data()
        for crop in data['crops']:
            if crop['id'] == crop_id:
                return crop
        return None

    def update_crop(self, crop_id, update_data):
        data = self._load_data()
        for crop in data['crops']:
            if crop['id'] == crop_id:
                crop.update(update_data)
                crop['updated_at'] = datetime.now().isoformat()
                if self._save_data(data):
                    print(f"✅ Crop updated: {crop_id}")
                    return crop
        return None

    def delete_crop(self, crop_id):
        data = self._load_data()
        initial_length = len(data['crops'])
        data['crops'] = [crop for crop in data['crops'] if crop['id'] != crop_id]
        if len(data['crops']) < initial_length:
            if self._save_data(data):
                print(f"✅ Crop deleted: {crop_id}")
                return True
        return False

    # Blog Management
    def add_blog(self, blog_data):
        data = self._load_data()
        blog_id = len(data['blogs']) + 1
        blog = {
            'id': blog_id,
            **blog_data,
            'created_at': datetime.now().isoformat()
        }
        data['blogs'].append(blog)
        if self._save_data(data):
            print(f"✅ Blog added: {blog_data['title']}")
            return blog
        return None

    def get_all_blogs(self):
        data = self._load_data()
        return data['blogs']

    def delete_blog(self, blog_id):
        data = self._load_data()
        initial_length = len(data['blogs'])
        data['blogs'] = [blog for blog in data['blogs'] if blog['id'] != blog_id]
        if len(data['blogs']) < initial_length:
            if self._save_data(data):
                print(f"✅ Blog deleted: {blog_id}")
                return True
        return False

# Initialize Data Manager
data_manager = DataManager()

# Authentication Decorators
def login_required(f):
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please login first!', 'error')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please login first!', 'error')
            return redirect(url_for('login'))
        if session.get('role') != 'admin':
            flash('Admin access required!', 'error')
            return redirect(url_for('dashboard'))
        return f(*args, **kwargs)
    return decorated_function

# Routes
@app.route('/')
def index():
    blogs = data_manager.get_all_blogs()[:3]
    return render_template('index.html', blogs=blogs)

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '').strip()
        email = request.form.get('email', '').strip()
        phone = request.form.get('phone', '').strip()
        role = request.form.get('role', 'user')

        if not username or not password or not email:
            flash('Username, password and email are required!', 'error')
            return redirect(url_for('register'))

        if data_manager.get_user_by_username(username):
            flash('Username already exists!', 'error')
            return redirect(url_for('register'))

        user_data = {
            'username': username,
            'password': password,
            'email': email,
            'phone': phone,
            'role': role
        }

        user = data_manager.add_user(user_data)
        if user:
            flash('Registration successful! Please login.', 'success')
            return redirect(url_for('login'))
        else:
            flash('Registration failed! Please try again.', 'error')

    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '').strip()

        user = data_manager.get_user_by_username(username)
        if user and user['password'] == password:
            session['user_id'] = user['id']
            session['username'] = user['username']
            session['role'] = user['role']
            session['email'] = user.get('email', '')
            flash(f'Welcome back, {username}!', 'success')
            print(f"✅ User logged in: {username}")
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid username or password!', 'error')
            print(f"❌ Login failed: {username}")

    return render_template('login.html')

@app.route('/dashboard')
@login_required
def dashboard():
    user_crops = data_manager.get_user_crops(session['username'])
    total_crops = len(user_crops)
    total_area = sum(float(crop.get('area', 0)) for crop in user_crops)
    total_yield = sum(float(crop.get('expected_yield', 0)) for crop in user_crops)

    return render_template('dashboard.html',
                         username=session['username'],
                         role=session['role'],
                         crops=user_crops,
                         total_crops=total_crops,
                         total_area=total_area,
                         total_yield=total_yield)

@app.route('/add_crop', methods=['GET', 'POST'])
@login_required
def add_crop():
    if request.method == 'POST':
        crop_name = request.form.get('crop_name', '').strip()
        crop_type = request.form.get('crop_type', '').strip()
        area = request.form.get('area', '0').strip()
        season = request.form.get('season', '').strip()
        expected_yield = request.form.get('expected_yield', '0').strip()
        price = request.form.get('price', '0').strip()
        description = request.form.get('description', '').strip()

        if not crop_name or not crop_type:
            flash('Crop name and type are required!', 'error')
            return redirect(url_for('add_crop'))

        try:
            area = float(area)
            expected_yield = float(expected_yield)
            price = float(price)
        except ValueError:
            flash('Please enter valid numbers for area, yield and price!', 'error')
            return redirect(url_for('add_crop'))

        crop_data = {
            'crop_name': crop_name,
            'crop_type': crop_type,
            'area': area,
            'season': season,
            'expected_yield': expected_yield,
            'price': price,
            'description': description,
            'farmer': session['username'],
            'status': 'Planted'
        }

        crop = data_manager.add_crop(crop_data)
        if crop:
            flash('Crop added successfully!', 'success')
            return redirect(url_for('view_crops'))
        else:
            flash('Failed to add crop!', 'error')

    return render_template('add_crop.html')

@app.route('/edit_crop/<int:crop_id>', methods=['GET', 'POST'])
@login_required
def edit_crop(crop_id):
    crop = data_manager.get_crop_by_id(crop_id)

    if not crop:
        flash('Crop not found!', 'error')
        return redirect(url_for('view_crops'))

    # Check permission
    if crop.get('farmer') != session['username'] and session.get('role') != 'admin':
        flash('You can only edit your own crops!', 'error')
        return redirect(url_for('view_crops'))

    if request.method == 'POST':
        crop_name = request.form.get('crop_name', '').strip()
        crop_type = request.form.get('crop_type', '').strip()
        area = request.form.get('area', '0').strip()
        season = request.form.get('season', '').strip()
        expected_yield = request.form.get('expected_yield', '0').strip()
        price = request.form.get('price', '0').strip()
        description = request.form.get('description', '').strip()
        status = request.form.get('status', 'Planted').strip()

        if not crop_name or not crop_type:
            flash('Crop name and type are required!', 'error')
            return redirect(url_for('edit_crop', crop_id=crop_id))

        try:
            area = float(area)
            expected_yield = float(expected_yield)
            price = float(price)
        except ValueError:
            flash('Please enter valid numbers for area, yield and price!', 'error')
            return redirect(url_for('edit_crop', crop_id=crop_id))

        update_data = {
            'crop_name': crop_name,
            'crop_type': crop_type,
            'area': area,
            'season': season,
            'expected_yield': expected_yield,
            'price': price,
            'description': description,
            'status': status
        }

        if data_manager.update_crop(crop_id, update_data):
            flash('Crop updated successfully!', 'success')
            return redirect(url_for('view_crops'))
        else:
            flash('Failed to update crop!', 'error')

    return render_template('edit_crop.html', crop=crop)

@app.route('/view_crops')
@login_required
def view_crops():
    if session.get('role') == 'admin':
        crops = data_manager.get_all_crops()
    else:
        crops = data_manager.get_user_crops(session['username'])
    return render_template('view_crops.html', crops=crops)

@app.route('/delete_crop/<int:crop_id>')
@login_required
def delete_crop(crop_id):
    crop = data_manager.get_crop_by_id(crop_id)

    if not crop:
        flash('Crop not found!', 'error')
        return redirect(url_for('view_crops'))

    # Check permission
    if crop.get('farmer') != session['username'] and session.get('role') != 'admin':
        flash('You can only delete your own crops!', 'error')
        return redirect(url_for('view_crops'))

    if data_manager.delete_crop(crop_id):
        flash('Crop deleted successfully!', 'success')
    else:
        flash('Failed to delete crop!', 'error')

    return redirect(url_for('view_crops'))

@app.route('/admin')
@admin_required
def admin_dashboard():
    all_users = data_manager.get_all_users()
    all_crops = data_manager.get_all_crops()
    all_blogs = data_manager.get_all_blogs()

    total_users = len(all_users)
    total_crops = len(all_crops)
    total_farmers = len([u for u in all_users if u.get('role') == 'user'])
    total_area = sum(float(crop.get('area', 0)) for crop in all_crops)

    return render_template('admin_dashboard.html',
                         users=all_users,
                         crops=all_crops,
                         blogs=all_blogs,
                         username=session['username'],
                         total_users=total_users,
                         total_crops=total_crops,
                         total_farmers=total_farmers,
                         total_area=total_area)

@app.route('/add_blog', methods=['GET', 'POST'])
@admin_required
def add_blog():
    if request.method == 'POST':
        title = request.form.get('title', '').strip()
        content = request.form.get('content', '').strip()
        category = request.form.get('category', 'Farming Tips').strip()

        if not title or not content:
            flash('Title and content are required!', 'error')
            return redirect(url_for('add_blog'))

        blog_data = {
            'title': title,
            'content': content,
            'category': category,
            'author': session['username']
        }

        if data_manager.add_blog(blog_data):
            flash('Blog published successfully!', 'success')
            return redirect(url_for('admin_dashboard'))
        else:
            flash('Failed to publish blog!', 'error')

    return render_template('add_blog.html')

@app.route('/blogs')
def blogs():
    all_blogs = data_manager.get_all_blogs()
    return render_template('blogs.html', blogs=all_blogs)

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/farm_map')
def farm_map():
    return render_template('farm_map.html')

@app.route('/logout')
def logout():
    username = session.get('username', 'Unknown')
    session.clear()
    flash('Logged out successfully!', 'success')
    print(f"✅ User logged out: {username}")
    return redirect(url_for('index'))

if __name__ == '__main__':
    print("=" * 60)
    print("🌾 SMARTFARM PROFESSIONAL MANAGEMENT SYSTEM")
    print("📍 URL: http://localhost:5000")
    print("📍 Test: http://localhost:5000/test")
    print("👤 Default Admin: admin / admin123")
    print("📁 Data Location: instance/farm_data.json")
    print("=" * 60)
    app.run(debug=True, host='0.0.0.0', port=5000)