from flask import Flask, request, jsonify, render_template
from pymongo import MongoClient
from bson.objectid import ObjectId
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# Initialize MongoDB client
client = MongoClient("mongodb+srv://dealcost24:dealcost@dealcostdb.crtb7.mongodb.net/")
db = client.accounts  # Database name: accounts

# Reference to collections
users_collection = db.accountsdb
inventory_collection = db.inventory

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/create_account', methods=['POST'])
def create_account():
    try:
        user_data = request.json

        # Validate the incoming data
        if not all(k in user_data for k in ("username", "password", "email", "company_name", "phone_number")):
            return jsonify({"error": "Missing required fields"}), 400
        
        password_hash = generate_password_hash(user_data["password"], method='sha256')

        # Insert the new user into the database
        new_user = {
            "username": user_data["username"],
            "password": password_hash,
            "email": user_data["email"],
            "company_name": user_data["company_name"],
            "phone_number": user_data.get("phone_number")
        }
        result = users_collection.insert_one(new_user)

        return jsonify({"message": "User created successfully", "user_id": str(result.inserted_id)}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/login', methods=['POST'])
def login():
    try:
        login_data = request.json

        # Validate the incoming data
        if not all(k in login_data for k in ("username", "password")):
            return jsonify({"error": "Missing required fields"}), 400

        # Retrieve user by username
        user = users_collection.find_one({"username": login_data["username"]})
        
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Check if the provided password hash matches the stored password hash
        if not check_password_hash(user["password_hash"], login_data["password"]):
            return jsonify({"error": "Invalid username or password"}), 401

        return jsonify({"message": "Login successful", "user_id": str(user["_id"])}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/insert_vehicle', methods=['POST'])
def insert_vehicle():
    try:
        vehicle_data = request.json

        # Validate the incoming data
        if not all(k in vehicle_data for k in ("user_id", "item_name", "item_description", "quantity", "price")):
            return jsonify({"error": "Missing required fields"}), 400

        # Check if the user exists
        user_id = vehicle_data["user_id"]
        if not users_collection.find_one({"_id": ObjectId(user_id)}):
            return jsonify({"error": "User not found"}), 404

        # Insert the new vehicle into the inventory
        new_vehicle = {
            "user_id": ObjectId(user_id),
            "item_name": vehicle_data["item_name"],
            "item_description": vehicle_data["item_description"],
            "quantity": vehicle_data["quantity"],
            "price": vehicle_data["price"]
        }
        result = inventory_collection.insert_one(new_vehicle)

        return jsonify({"message": "Vehicle inserted successfully", "item_id": str(result.inserted_id)}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
