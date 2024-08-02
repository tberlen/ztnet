import requests
import json
import os

vultr_api = os.getenv('VULTR_API_KEY')

# Read the API token from the file
api_key_file = "vultr_api"
with open(api_key_file, "r") as file:
    api_token = file.read().strip()

headers = {
    "Authorization": f"Bearer {api_token}",
    "Content-Type": "application/json"
}

# Function to fetch controller IPs
def fetch_controller_ips():
    api_url = "https://api.vultr.com/v2/instances"
    response = requests.get(api_url, headers=headers)
    controller_ips = []

    if response.status_code == 200:
        data = response.json()
        for instance in data['instances']:
            if "controller" in instance['tags']:
                controller_ips.append(instance['main_ip'])
    else:
        print(f"Failed to fetch instances. Status code: {response.status_code}, Response: {response.text}")

    return controller_ips, response.status_code

# Function to fetch ZTNET_GENERAL database ID
def fetch_ztnet_general_database_id():
    api_url = "https://api.vultr.com/v2/databases"
    response = requests.get(api_url, headers=headers)
    ztnet_general_id = None

    if response.status_code == 200:
        data = response.json()
        for db in data['databases']:
            if db['label'].lower() == "ztnet_general":  # Ensure label check is case-insensitive
                ztnet_general_id = db['id']
                break
    else:
        print(f"Failed to fetch databases. Status code: {response.status_code}, Response: {response.text}")

    return ztnet_general_id, response.status_code

# Function to update trusted IPs for ZTNET_GENERAL database
def update_trusted_ips(database_id, trusted_ips):
    api_url = f"https://api.vultr.com/v2/databases/{database_id}"
    update_data = {
        "trusted_ips": trusted_ips
    }

    update_response = requests.put(api_url, headers=headers, data=json.dumps(update_data))
    
    if update_response.status_code == 202:
        print(f"Successfully updated trusted IPs for database ID {database_id}.")
        print("Response: Accepted for processing.")
    elif update_response.status_code == 200:
        print(f"Successfully updated trusted IPs for database ID {database_id}.")
    else:
        print(f"Failed to update trusted IPs. Status code: {update_response.status_code}, Response: {update_response.text}")

# Main function
def main():
    # Step 1: Fetch controller IPs
    controller_ips, status_code = fetch_controller_ips()

    if status_code != 200 or not controller_ips:
        print("No controller IPs found or failed to fetch instances.")
        return

    # Step 2: Fetch ZTNET_GENERAL database ID
    ztnet_general_id, status_code = fetch_ztnet_general_database_id()

    if status_code != 200 or not ztnet_general_id:
        print("Database with label 'ZTNET_GENERAL' not found or failed to fetch databases.")
        return

    # Step 3: Update trusted IPs for ZTNET_GENERAL database
    update_trusted_ips(ztnet_general_id, controller_ips)

    # Remove the API key file
    try:
        os.remove(api_key_file)
        print(f"Successfully removed the API key file: {api_key_file}")
    except OSError as e:
        print(f"Error removing the API key file: {api_key_file}. Error: {e}")

# Run the main function
if __name__ == "__main__":
    main()
