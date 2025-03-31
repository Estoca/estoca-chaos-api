from typing import Any, Dict

from jsf import JSF


def generate_data_from_schema(schema: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generates a dictionary of fake data based on the provided JSON schema.

    Args:
        schema: The JSON schema as a Python dictionary.

    Returns:
        A dictionary containing the generated fake data.

    Raises:
        Exception: If data generation fails.
    """
    try:
        # TODO: Consider adding more robust error handling or logging
        faker = JSF(schema)
        fake_data = faker.generate()
        return fake_data
    except Exception as e:
        # TODO: Log the specific error for better debugging
        # logger.error(f"Failed to generate data from schema: {e}", exc_info=True)
        raise Exception(f"Failed to generate data from schema: {e}")

# Example usage (optional, for testing)
# if __name__ == "__main__":
#     test_schema = {
#         "type": "object",
#         "properties": {
#             "name": {"type": "string", "$provider": "faker.name"},
#             "email": {"type": "string", "format": "email", "$provider": "faker.email"},
#             "age": {"type": "integer", "minimum": 18, "maximum": 99},
#             "is_active": {"type": "boolean"},
#             "address": {
#                 "type": "object",
#                 "properties": {
#                     "street": {"type": "string", "$provider": "faker.street_address"},
#                     "city": {"type": "string", "$provider": "faker.city"},
#                 },
#                 "required": ["street", "city"]
#             }
#         },
#         "required": ["name", "email", "age"]
#     }
#     
#     generated_data = generate_data_from_schema(test_schema)
#     import json
#     print(json.dumps(generated_data, indent=2)) 