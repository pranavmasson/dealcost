from flask import Flask, request, jsonify, render_template
from pymongo import MongoClient
from bson.objectid import ObjectId
from flask_cors import CORS, cross_origin
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime, timedelta
import pytesseract
from PIL import Image
import io
import re

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True, allow_headers=["Content-Type", "Authorization"])

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
        required_fields = [
            "username", "password", "email", "company_name", 
            "phone_number", "street_address", "city", "state", 
            "zip_code", "country"
        ]
        
        if not all(k in user_data for k in required_fields):
            return jsonify({"error": "Missing required fields"}), 400
        
        password_hash = generate_password_hash(user_data["password"], method='pbkdf2:sha256')

        # Insert the new user into the database
        new_user = {
            "username": user_data["username"],
            "password": password_hash,
            "email": user_data["email"],
            "company_name": user_data["company_name"],
            "phone_number": user_data["phone_number"],
            "address": {
                "street": user_data["street_address"],
                "city": user_data["city"],
                "state": user_data["state"],
                "zip_code": user_data["zip_code"],
                "country": user_data["country"]
            }
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
        user = users_collection.find_one({"username": login_data["username"]})
        
        if not user:
            return jsonify({"error": "User not found"}), 404

        if not check_password_hash(user.get("password", ""), login_data["password"]):
            return jsonify({"error": "Invalid username or password"}), 401

        # Ensure we're sending back the correct data
        return jsonify({
            "message": "Login successful",
            "user_id": str(user["_id"]),
            "username": user["username"],  # This is the actual username
            "company_name": user.get("company_name", "")
        }), 200

    except Exception as e:
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
            "sale_price": float(vehicle_data.get("sale_price", 0)),
            "sale_status": "available",
            "date_added": str(datetime.now().strftime('%m/%d/%Y')),
            "date_sold": "",  # Initialize date_sold to an empty string
            "sale_type": vehicle_data.get("sale_type", "dealer"),
            "closing_statement": vehicle_data.get("closing_statement", ""),
            "finance_type": vehicle_data.get("finance_type", ""),
            "purchase_date": vehicle_data.get("purchase_date", ""),
            "title_received": vehicle_data.get("title_received", ""),
            "inspection_received": vehicle_data.get("inspection_received", "no"),  # Add inspection field
            "pending_issues": vehicle_data.get("pending_issues", ""),
            "inspection_status": vehicle_data.get("inspection_status", "")
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

        # Delete only the related reports for the car based on both VIN and username
        reports_collection.delete_many({"vin": vin, "username": username})

        return jsonify({"message": "Vehicle and related reports deleted successfully"}), 200

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
    
# @app.route('/api/inventory/<vin>', methods=['GET'])
# def get_vehicle_by_vin(vin):
#     try:
#         vehicle = inventory_collection.find_one({"vin": vin})
        
#         if vehicle:
#             # Remove ObjectId from the response if needed
#             vehicle['_id'] = str(vehicle['_id'])
#             return jsonify(vehicle), 200
#         else:
#             return jsonify({"error": "Vehicle not found"}), 404
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500
    
@app.route('/api/user/<user_id>', methods=['GET'])
def get_user(user_id):
    try:
        print(f"Searching for user with ID: {user_id}")
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        print(f"Found user: {user}")
        
        if not user:
            return jsonify({"error": "User not found"}), 404

        user_data = {
            "username": user["username"],
            "email": user["email"],
            "company_name": user["company_name"],
            "phone_number": user.get("phone_number", ""),
            "address": {
                "street": user.get("address", {}).get("street", ""),
                "city": user.get("address", {}).get("city", ""),
                "state": user.get("address", {}).get("state", ""),
                "zip_code": user.get("address", {}).get("zip_code", ""),
                "country": user.get("address", {}).get("country", "")
            }
        }

        return jsonify(user_data), 200
    except Exception as e:
        print(f"Error in get_user: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/user/<user_id>', methods=['PUT'])
def update_user(user_id):
    try:
        print(f"Received update request for user_id: {user_id}")
        data = request.json
        print(f"Update data received: {data}")

        # First check if user exists
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            print(f"No user found with ID: {user_id}")
            return jsonify({"error": "User not found"}), 404

        # Create address object matching the existing structure
        address = {
            "street": data.get("street_address", ""),
            "city": data.get("city", ""),
            "country": data.get("country", ""),
            "state": data.get("state", ""),
            "zip_code": data.get("zip_code", "")
        }

        update_data = {
            "username": data["username"],
            "email": data["email"],
            "company_name": data["company_name"],
            "phone_number": data["phone_number"],
            "address": address
        }

        print(f"Updating with data: {update_data}")

        result = users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        print(f"Update result: {result.modified_count} documents modified")
        
        if result.modified_count > 0 or result.matched_count > 0:
            return jsonify({"message": "User updated successfully"}), 200
        else:
            return jsonify({"error": "No changes made"}), 200

    except Exception as e:
        print(f"Error in update_user: {str(e)}")
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
            "sale_status": vehicle_data["sale_status"],
            "purchase_date": vehicle_data.get("purchase_date", ""),
            "title_received": vehicle_data.get("title_received", ""),
            "inspection_received": vehicle_data.get("inspection_received", "no"),  # Add inspection field
            "closing_statement": vehicle_data.get("closing_statement", ""),
            "pending_issues": vehicle_data.get("pending_issues", ""),
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
    
@app.route('/api/report/<report_id>', methods=['GET'])
def get_report(report_id):
    try:
        report = reports_collection.find_one({"_id": ObjectId(report_id)})
        if report:
            report['_id'] = str(report['_id'])  # Convert ObjectId to string for JSON serialization
            return jsonify(report), 200
        else:
            return jsonify({"error": "Report not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/report/<report_id>', methods=['PUT'])
def update_report(report_id):
    try:
        data = request.json  # Get the updated data from the request
        update_fields = {
            "date_occurred": data.get('date_occurred'),
            "cost": data.get('cost'),
            "category": data.get('category'),
            "vendor": data.get('vendor'),
            "description": data.get('description'),
            "receipt": data.get('receipt', "")  # If receipt is implemented
        }

        # Update the report in the database
        result = reports_collection.update_one(
            {"_id": ObjectId(report_id)},
            {"$set": update_fields}
        )

        if result.matched_count:
            return jsonify({"message": "Report updated successfully"}), 200
        else:
            return jsonify({"error": "Report not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/dashboard', methods=['GET'])
def get_dashboard_data():
    try:
        username = request.args.get('username')
        print(f"Received request for username: {username}")
        
        if not username:
            return jsonify({"error": "Username is required"}), 400

        # Debug: Check if we can find any inventory for this user's _id
        inventory_count = inventory_collection.count_documents({"username": username})
        print(f"Found {inventory_count} inventory items for user ID {username}")

        # Get all inventory using the user's _id
        all_inventory = list(inventory_collection.find({"username": username}))
        print(f"Retrieved inventory: {all_inventory}")
        
        # Convert ObjectId to string for JSON serialization
        for car in all_inventory:
            car['_id'] = str(car['_id'])

        # Get all unsold inventory
        unsold_inventory = [car for car in all_inventory if car.get('sale_status') != 'sold']
        print(f"Unsold inventory count: {len(unsold_inventory)}")

        # Calculate metrics
        total_vehicles = len(unsold_inventory)
        total_inventory_value = sum(float(car.get('purchase_price', 0)) for car in unsold_inventory)
        
        # Get counts by sale type
        total_floor_plan = sum(1 for car in unsold_inventory if car.get('sale_type') == 'floor')
        total_dealership = sum(1 for car in unsold_inventory if car.get('sale_type') == 'dealer')
        total_consignment = sum(1 for car in unsold_inventory if car.get('sale_type') == 'consignment')

        response_data = {
            "inventory": all_inventory,
            "total_vehicles": total_vehicles,
            "total_inventory_value": total_inventory_value,
            "current_month_reconditioning_cost": 0,
            "current_month_profit": 0,
            "total_floor_plan": total_floor_plan,
            "total_dealership": total_dealership,
            "total_consignment": total_consignment,
            "unsold_reconditioning_cost": 0,
        }
        
        print(f"Sending response data: {response_data}")
        return jsonify(response_data), 200

    except Exception as e:
        print(f"Dashboard Error: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/scan_document', methods=['POST'])
def scan_document():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400

    image = request.files['image']
    image = Image.open(io.BytesIO(image.read()))

    # Perform OCR on the image
    text = pytesseract.image_to_string(image)

    # Initialize result dictionary with None
    result = {
        "date_occurred": None,
        "service_provider": None,
        "cost": None
    }

    # Extract information from OCR text
    result["date_occurred"] = extract_date(text) or result["date_occurred"]
    result["service_provider"] = extract_service_provider(text) or result["service_provider"]
    result["cost"] = extract_cost(text) or result["cost"]

    # Only include fields that have values (do not overwrite with None)
    result = {k: v for k, v in result.items() if v is not None}

    return jsonify(result)

# Helper function to extract dates in various formats (MM/DD/YYYY, YYYY-MM-DD, etc.)
def extract_date(text):
    match = re.search(r'\b(\d{2}[/-]\d{2}[/-]\d{4}|\d{4}[/-]\d{2}[/-]\d{2})\b', text)
    return match.group(1) if match else None

# Helper function to extract the service provider name
def extract_service_provider(text):
    lines = text.splitlines()
    for line in lines:
        # Skip lines with dollar amounts or dates, and assume longer lines might be provider names
        if len(line.strip()) > 3 and not re.search(r'\$\d+', line) and not extract_date(line):
            return line.strip()
    return None

# Helper function to extract costs, ensuring dollar sign consistency
def extract_cost(text):
    # This regex matches dollar amounts in various formats
    match = re.search(r'(\$?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)', text)
    if match:
        cost = match.group(1)
        # Ensure the dollar sign is included, even if OCR missed it
        return cost if cost.startswith('$') else f"${cost}"
    return None

@app.route('/api/company_name/<username>', methods=['GET'])
def get_company_name(username):
    try:
        user = users_collection.find_one({"username": username})
        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            "company_name": user.get("company_name", "")
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)