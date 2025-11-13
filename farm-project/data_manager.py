import json
import os
from datetime import datetime

class DataManager:
    def __init__(self):
        self.instance_path = 'instance'
        self.data_file = os.path.join(self.instance_path, 'data.json')
        self._ensure_instance_folder()
        self._initialize_data()

    def _ensure_instance_folder(self):
        if not os.path.exists(self.instance_path):
            os.makedirs(self.instance_path)

    def _initialize_data(self):
        if not os.path.exists(self.data_file):
            initial_data = {
                'users': [],
                'crops': [],
                'farm_data': []
            }
            self._save_data(initial_data)

    def _load_data(self):
        try:
            with open(self.data_file, 'r') as f:
                return json.load(f)
        except:
            return {'users': [], 'crops': [], 'farm_data': []}

    def _save_data(self, data):
        with open(self.data_file, 'w') as f:
            json.dump(data, f, indent=4)

    # User methods
    def add_user(self, username, password, role='user'):
        data = self._load_data()
        user = {
            'id': len(data['users']) + 1,
            'username': username,
            'password': password,  # In real app, hash the password
            'role': role,
            'created_at': datetime.now().isoformat()
        }
        data['users'].append(user)
        self._save_data(data)
        return user

    def get_user_by_username(self, username):
        data = self._load_data()
        for user in data['users']:
            if user['username'] == username:
                return user
        return None

    # Crop methods
    def add_crop(self, crop_data):
        data = self._load_data()
        crop = {
            'id': len(data['crops']) + 1,
            **crop_data,
            'created_at': datetime.now().isoformat()
        }
        data['crops'].append(crop)
        self._save_data(data)
        return crop

    def get_all_crops(self):
        data = self._load_data()
        return data['crops']

    def get_user_crops(self, username):
        data = self._load_data()
        return [crop for crop in data['crops'] if crop.get('farmer') == username]

    def delete_crop(self, crop_id):
        data = self._load_data()
        data['crops'] = [crop for crop in data['crops'] if crop['id'] != crop_id]
        self._save_data(data)

    # Admin methods
    def get_all_users(self):
        data = self._load_data()
        return data['users']

    def delete_user(self, user_id):
        data = self._load_data()
        data['users'] = [user for user in data['users'] if user['id'] != user_id]
        self._save_data(data)