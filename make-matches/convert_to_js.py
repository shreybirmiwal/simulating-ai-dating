#python3 convert_to_js.py > profiles.js
import csv
import json

with open('export_data.csv', 'r', newline='', encoding='utf-8') as file:
    reader = csv.reader(file)
    headers = next(reader)
    
    # Handle empty first header
    if not headers[0]:
        headers[0] = "ID"
    
    profiles = []
    for row in reader:
        profile = dict(zip(headers, row))
        
        # Convert numerical fields
        for num_key in ['Age', 'ID']:
            if profile.get(num_key):
                try:
                    profile[num_key] = int(profile[num_key])
                except ValueError:
                    pass
        
        # Process array fields and string escaping
        for key in profile:
            value = profile[key]
            if isinstance(value, str):
                stripped = value.strip()
                # Check for array pattern
                if stripped.startswith('[') and stripped.endswith(']'):
                    try:
                        # Parse JSON array
                        parsed = json.loads(stripped)
                        if isinstance(parsed, list):
                            profile[key] = parsed
                            continue  # Skip string processing
                    except json.JSONDecodeError:
                        pass
                # Escape regular strings
                profile[key] = json.dumps(value)[1:-1]
        
        profiles.append(profile)

# Generate JS output with proper array formatting
print("export const profiles = [")
for p in profiles:
    print("  {")
    for key, value in p.items():
        if isinstance(value, (int, float)):
            print(f"    {key}: {value},")
        elif isinstance(value, list):
            js_array = '[' + ', '.join(map(str, value)) + ']'
            print(f"    {key}: {js_array},")
        else:
            print(f'    {key}: "{value}",')
    print("  },")
print("];")