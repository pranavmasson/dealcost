from flask import Flask, request, jsonify, render_template
from pymongo import MongoClient
from bson.objectid import ObjectId
from flask_cors import CORS, cross_origin
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

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
  response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  response.headers.add('Access-Control-Allow-Credentials', 'true')
  return response

@app.route('/api/create_account', methods=['POST', 'OPTIONS'])
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
        
        print(user["company_name"])

        return jsonify({
            "message": "Login successful",
            "user_id": str(user["_id"]),
            "company_name": str(user["company_name"])  # Safely retrieve company_name
        }), 200

    except Exception as e:
        # Print error to console for debugging
        print(f"An error occurred: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/insert_vehicle', methods=['POST', 'OPTIONS'])
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
            "sale_price": float(vehicle_data.get("sale_price", 0)),  # Optional field
            "sale_status": "false",
            "date_added": str(datetime.now().strftime('%m/%d/%Y')),
            "date_sold": ""  # Initialize date_sold to an empty string
        }
        result = inventory_collection.insert_one(new_vehicle)

        return jsonify({"message": "Vehicle inserted successfully", "item_id": str(result.inserted_id)}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/inventory', methods=['GET'])
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

@app.route('/api/delete_vehicle', methods=['DELETE'])
def delete_vehicle():
    try:
        vehicle_data = request.json
        vin = vehicle_data.get('vin')
        username = vehicle_data.get('username')

        if not vin or not username:
            return jsonify({"error": "Missing VIN or username"}), 400

        # Check if the car exists in the inventory
        car = inventory_collection.find_one({"vin": vin, "username": username})
        if not car:
            return jsonify({"error": "Car not found"}), 404

        # Delete the car from the inventory
        inventory_collection.delete_one({"vin": vin, "username": username})

        return jsonify({"message": "Vehicle deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/delete_report', methods=['DELETE'])
def delete_report():
    try:
        data = request.json
        report_id = data.get('id')

        if not report_id:
            return jsonify({"error": "Missing report ID"}), 400

        # Check if the report exists
        report = reports_collection.find_one({"_id": ObjectId(report_id)})
        if not report:
            return jsonify({"error": "Report not found"}), 404

        # Delete the report from the database
        reports_collection.delete_one({"_id": ObjectId(report_id)})

        return jsonify({"message": "Report deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/inventory/<vin>', methods=['GET'])
def get_vehicle_by_vin(vin):
    try:
        vehicle = inventory_collection.find_one({"vin": vin})
        
        if vehicle:
            # Remove ObjectId from the response if needed
            vehicle['_id'] = str(vehicle['_id'])
            return jsonify(vehicle), 200
        else:
            return jsonify({"error": "Vehicle not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/user/<user_id>', methods=['GET'])
def get_user(user_id):
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Exclude password hash when returning user data
        user_data = {
            "username": user["username"],
            "email": user["email"],
            "company_name": user["company_name"],
            "phone_number": user.get("phone_number", "")
        }

        return jsonify(user_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/user/<user_id>', methods=['PUT'])
def update_user(user_id):
    try:
        user_data = request.json
        # Validate the incoming data
        if not all(k in user_data for k in ("username", "email", "company_name")):
            return jsonify({"error": "Missing required fields"}), 400

        # Update user data in the database
        update_result = users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {
                "username": user_data["username"],
                "email": user_data["email"],
                "company_name": user_data["company_name"],
                "phone_number": user_data.get("phone_number", "")
            }}
        )

        if update_result.modified_count == 0:
            return jsonify({"error": "User not updated"}), 404

        return jsonify({"message": "User updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/update_vehicle/<vin>', methods=['PUT'])
def update_vehicle(vin):
    try:
        vehicle_data = request.json
        
        # Prepare the update data
        update_fields = {
            "make": vehicle_data["make"],
            "model": vehicle_data["model"],
            "year": vehicle_data["year"],
            "mileage": vehicle_data["mileage"],
            "color": vehicle_data["color"],
            "purchase_price": vehicle_data["purchase_price"],
            "sale_price": vehicle_data.get("sale_price", 0),
            "sale_status": vehicle_data["sale_status"]
        }

        # If the car is marked as sold, include the current date
        if vehicle_data["sale_status"] == "sold":
            update_fields["date_sold"] = vehicle_data.get("date_sold", "")
        else:
            update_fields["date_sold"] = ""

        # Update the vehicle in the database
        result = inventory_collection.update_one(
            {"vin": vin},
            {"$set": update_fields}
        )
        if result.modified_count == 0:
            return jsonify({"error": "Vehicle not updated"}), 404

        return jsonify({"message": "Vehicle updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/inventory/<vin>', methods=['GET'])
def get_car_by_vin(vin):
    try:
        car = inventory_collection.find_one({"vin": vin})
        if not car:
            return jsonify({"error": "Car not found"}), 404
        # Ensure ObjectId is serialized properly
        car['_id'] = str(car['_id'])
        return jsonify(car), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)