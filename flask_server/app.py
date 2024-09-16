from flask import Flask, request, jsonify, render_template
from pymongo import MongoClient
from bson.objectid import ObjectId
from flask_cors import CORS, cross_origin
from werkzeug.security import check_password_hash, generate_password_hash

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Initialize MongoDB client
client = MongoClient("mongodb+srv://dealcost24:dealcost@dealcostdb.crtb7.mongodb.net/")
db = client.accounts  # Database name: accounts

# Reference to collections
users_collection = db.accountsdb
inventory_collection = db.inventory
reports_collection = db.reports

@app.route('/')
def index():
    return render_template('index.html')

@app.after_request
def after_request(response):
  response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
  response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  response.headers.add('Access-Control-Allow-Credentials', 'true')
  return response

@app.route('/api/create_account', methods=['POST', 'OPTIONS'])
@cross_origin()
def create_account():
    if request.method == 'OPTIONS':
        # Preflight request handling
        response = app.make_default_options_response()
        headers = None
        if request.method == 'OPTIONS':
            headers = {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
        response.headers.update(headers)
        return response
    try:
        user_data = request.json
        print(user_data)

        # Validate the incoming data
        if not all(k in user_data for k in ("username", "password", "email", "company_name", "phone_number")):
            return jsonify({"error": "Missing required fields"}), 400
        
        password_hash = generate_password_hash(user_data["password"], method='pbkdf2:sha256')

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
    
@app.route('/api/login', methods=['POST', 'OPTIONS'])
@cross_origin()  # Apply CORS to this route
def login():
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = app.make_default_options_response()
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
        response.headers.update(headers)
        return response

    try:
        login_data = request.json

        # Validate the incoming data
        if not all(k in login_data for k in ("username", "password")):
            return jsonify({"error": "Missing required fields"}), 400

        # Retrieve user by username
        user = users_collection.find_one({"username": login_data["username"]})
        
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Check if the provided password matches the stored password hash
        if not check_password_hash(user.get("password", ""), login_data["password"]):
            return jsonify({"error": "Invalid username or password"}), 401

        return jsonify({"message": "Login successful", "user_id": str(user["_id"])}), 200

    except Exception as e:
        # Print error to console for debugging
        print(f"An error occurred: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/insert_vehicle', methods=['POST', 'OPTIONS'])
@cross_origin()
def insert_vehicle():
    if request.method == 'OPTIONS':
        # Preflight request handling
        response = app.make_default_options_response()
        headers = None
        if request.method == 'OPTIONS':
            headers = {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
        response.headers.update(headers)
        return response

    try:
        vehicle_data = request.json

        # Validate the incoming data
        required_fields = ["username", "vin", "make", "model", "year", "mileage", "color", "purchase_price"]
        if not all(k in vehicle_data for k in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        # Insert the new vehicle into the inventory
        new_vehicle = {
            "username": vehicle_data["username"],
            "vin": vehicle_data["vin"],
            "make": vehicle_data["make"],
            "model": vehicle_data["model"],
            "trim": vehicle_data.get("trim"),  # Optional field
            "year": int(vehicle_data["year"]),
            "mileage": int(vehicle_data["mileage"]),
            "color": vehicle_data["color"],
            "purchase_price": float(vehicle_data["purchase_price"]),
            "sale_price": float(vehicle_data.get("sale_price", 0))  # Optional field
        }
        result = inventory_collection.insert_one(new_vehicle)

        return jsonify({"message": "Vehicle inserted successfully", "item_id": str(result.inserted_id)}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/inventory', methods=['GET'])
@cross_origin()
def get_inventory():
    try:
        username = request.args.get('username')

        if not username:
            return jsonify({"error": "Username is required"}), 400

        # Retrieve all inventory items for the given username
        inventory_items = inventory_collection.find({"username": username})
        inventory_list = list(inventory_items)  # Convert to list for JSON serialization

        for item in inventory_list:
            item["_id"] = str(item["_id"])  # Convert ObjectId to string for JSON serialization

        return jsonify({"inventory": inventory_list}), 200

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/insert_report', methods=['POST'])
def insert_report():
    try:
        report_data = request.json
        reports_collection.insert_one(report_data)
        return jsonify({"message": "Report added successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/reports', methods=['GET'])
def get_reports():
    vin = request.args.get('vin')
    if not vin:
        return jsonify({"error": "VIN is required"}), 400
    
    reports = list(reports_collection.find({"vin": vin}))
    for report in reports:
        report["_id"] = str(report["_id"])  # Convert ObjectId to string for JSON serialization
    
    return jsonify({"records": reports}), 200

if __name__ == '__main__':
    app.run(debug=True)
