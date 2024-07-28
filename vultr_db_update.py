import requests
import json

# Read the API token from the file
with open("/root/VULTR_API_KEY", "r") as file:
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

# Function to fetch ZTNET database ID
def fetch_ztnet_database_id():
    api_url = "https://api.vultr.com/v2/databases"
    response = requests.get(api_url, headers=headers)
    ztnet_id = None

    if response.status_code == 200:
        data = response.json()
        for db in data['databases']:
            if db['label'] == "ztnet_general":
                ztnet_id = db['id']
                break
    else:
        print(f"Failed to fetch databases. Status code: {response.status_code}, Response: {response.text}")

    return ztnet_id, response.status_code

# Function to update trusted IPs for ztnet_general database
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

    # Step 2: Fetch ztnet_general database ID
    ztnet_id, status_code = fetch_ztnet_database_id()

    if status_code != 200 or not ztnet_id:
        print("Database with label 'ztnet_general' not found or failed to fetch databases.")
        return

    # Step 3: Update trusted IPs for ztnet_general database
    update_trusted_ips(ztnet_id, controller_ips)

# Run the main function
if __name__ == "__main__":
    main()
