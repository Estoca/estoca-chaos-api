import random
from typing import Any, Dict, List, Union
from datetime import datetime, timezone


def generate_from_schema(schema: Dict[str, Any]) -> Any:
    """Generate random data based on a JSON Schema."""
    if "type" not in schema:
        return None
    
    schema_type = schema["type"]
    
    if schema_type == "string":
        return generate_string(schema)
    elif schema_type == "number":
        return generate_number(schema)
    elif schema_type == "integer":
        return generate_integer(schema)
    elif schema_type == "boolean":
        return random.choice([True, False])
    elif schema_type == "array":
        return generate_array(schema)
    elif schema_type == "object":
        return generate_object(schema)
    elif schema_type == "null":
        return None
    else:
        return None


def generate_string(schema: Dict[str, Any]) -> str:
    """Generate a random string based on schema constraints."""
    if "enum" in schema:
        return random.choice(schema["enum"])
    
    min_length = schema.get("minLength", 5)
    max_length = schema.get("maxLength", 20)
    length = random.randint(min_length, max_length)
    
    if "pattern" in schema:
        # For now, just generate a random string if pattern is specified
        return "".join(random.choices("abcdefghijklmnopqrstuvwxyz", k=length))
    
    return "".join(random.choices("abcdefghijklmnopqrstuvwxyz", k=length))


def generate_number(schema: Dict[str, Any]) -> float:
    """Generate a random number based on schema constraints."""
    minimum = schema.get("minimum", 0)
    maximum = schema.get("maximum", 100)
    multiple_of = schema.get("multipleOf", 1)
    
    value = random.uniform(minimum, maximum)
    if multiple_of != 1:
        value = round(value / multiple_of) * multiple_of
    
    return value


def generate_integer(schema: Dict[str, Any]) -> int:
    """Generate a random integer based on schema constraints."""
    minimum = schema.get("minimum", 0)
    maximum = schema.get("maximum", 100)
    multiple_of = schema.get("multipleOf", 1)
    
    value = random.randint(minimum, maximum)
    if multiple_of != 1:
        value = round(value / multiple_of) * multiple_of
    
    return value


def generate_array(schema: Dict[str, Any]) -> List[Any]:
    """Generate a random array based on schema constraints."""
    min_items = schema.get("minItems", 1)
    max_items = schema.get("maxItems", 5)
    items = schema.get("items", {"type": "string"})
    
    length = random.randint(min_items, max_items)
    return [generate_from_schema(items) for _ in range(length)]


def generate_object(schema: Dict[str, Any]) -> Dict[str, Any]:
    """Generate a random object based on schema constraints."""
    properties = schema.get("properties", {})
    required = schema.get("required", [])
    
    result = {}
    
    # Add required properties
    for prop in required:
        if prop in properties:
            result[prop] = generate_from_schema(properties[prop])
    
    # Add optional properties with 50% probability
    for prop, prop_schema in properties.items():
        if prop not in required and random.random() < 0.5:
            result[prop] = generate_from_schema(prop_schema)
    
    return result 