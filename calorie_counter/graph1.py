import os
import requests
import base64
from typing import TypedDict, List, Dict
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from langgraph.graph import StateGraph, START, END

# Load environment variables
load_dotenv()

# ==========================================
# 1. Define the LangGraph State
# ==========================================
class CalorieState(TypedDict):
    image_base64: str
    detected_foods: List[Dict]
    total_calories: int
    total_protein: float
    total_carbs: float
    total_fat: float
    error: str

# ==========================================
# 2. Define Pydantic Schemas for Structured Output
# ==========================================
class FoodItem(BaseModel):
    item_name: str = Field(description="Generic name of the food item in lowercase")
    visual_reasoning: str = Field(description="Brief explanation of spatial reasoning and scaling")
    estimated_portion: str = Field(description="Estimated quantity AND standard unit, e.g., '1 cup', '100 grams', '1 whole'")
    portion_guessed: bool = Field(description="True if brand was stripped or portion was guessed/defaulted to 100 gram")

class MealExtraction(BaseModel):
    detected_foods: List[FoodItem] = Field(description="List of all food items found in the image")

# ==========================================
# 3. Define Graph Nodes
# ==========================================
def detect_food_node(state: CalorieState):
    """Sends the image to the Vision API and extracts structured JSON."""
    
    # Initialize the Groq Vision Model
    llm = ChatGroq(
        model="meta-llama/llama-4-scout-17b-16e-instruct",  # Ensure this matches your desired Groq vision model
        api_key=os.getenv("GROQ_API_KEY"),
        temperature=0.1,
    )

    # Force the model to output the exact Pydantic schema
    structured_llm = llm.with_structured_output(MealExtraction, method="json_mode")

    
    # The Master Prompt
    prompt = """You are an expert, highly precise AI nutritionist. Your task is to analyze images of food and extract all food items and output a strict, machine-readable JSON array of the detected items.

VISUAL ANALYSIS & DETECTION:

1. Deep Scan: Detect all food items, but actively look for secondary food or non-food items like sauces, dressings, oils, garnishes, cheese, and side dishes.
2. Visual Scaling & Portion Estimation: Estimate the portion size by comparing the food to relative objects in the frame (plates, bowls, utensils). 
3. 3D Depth Estimation (The Hidden Food Rule): DO NOT just count the visible surface layer. When food is stacked, piled, or inside containers (bowls, baskets, deep plates, bags), you MUST think in 3D. Estimate the depth of the container and the volume of the hidden food underneath. Predict the most accurate total quantity by multiplying the visible top layer by the estimated unseen layers.

CRITICAL RULES FOR PORTION SIZES:

You must format every portion using strict, standardized mathematical units so a downstream nutrition API can calculate the exact calories. You must choose the unit based on the physical state of the food:

1. MANDATORY FORMAT: Every portion must follow the formula: [Number] + [Standard Unit].
2. ALLOWED UNITS: Use ONLY standard units such as "whole", "piece", "slice", "cup", "tablespoon", "teaspoon", "grams", or "ounces".
3. FORBIDDEN WORDS: NEVER use subjective adjectives like "small", "medium", "large", "handful", "bowl", or "plate".
4. THE FALLBACK: If you cannot confidently determine the exact size or quantity of the food, you MUST default to "100 grams". 

EXAMPLES of GOOD portions: "1 whole", "2 slices", "1 cup", "150 grams".
EXAMPLES of BAD portions (DO NOT USE): "1", "1 medium", "a handful", "some".

CRITICAL MEASUREMENT RULES:

1. BRANDED & PACKAGED FOODS:
   -> If universally known global brand (e.g., "Snickers", "Oreo"), include it.
   -> If local/niche brand, STRIP the brand name and output ONLY generic food type (e.g., convert "Dairy Milk" to "milk chocolate bar"). 
   -> CRITICAL FLAG: If you strip a brand name, MUST set "portion_guessed": true.
   -> Allowed Units: "whole", "can", "bottle", "bag", "box", "package", "jar", "serving", "piece", "gram", "ounce", "pound".
   -> Example: "1 whole chocalate", "8 cans of coca cola".

2. DISCRETE / COUNTABLE FOODS:
   -> Allowed Units: "whole", "half", "piece", "slice", "wedge", "serving", "gram", "kilogram", "ounce", "pound".
   -> Example: "5 whole apple", "2 slices of sourdough bread", "1 wedge of watermelon".

3. LIQUIDS & SEMI-LIQUIDS:
   -> Allowed Units: "cup", "tablespoon", "teaspoon", "fluid ounce", "milliliter", "liter", "pint", "quart", "gallon", "drop", "serving".
   -> Example: "1 cup of tomato soup", "500 milliliters of milk", "1 drop of vanilla extract".

4. GRAINS, POWDERS, & PILES:
   -> Allowed Units: "cup", "tablespoon", "teaspoon", "gram", "kilogram", "ounce", "pound", "pint", "quart", "pinch", "serving".
   -> Example: "1 cup of cooked white rice", "150 grams of mashed potatoes", "1 pinch of salt".
5. MEATS & SOLID CUTS:
   -> Allowed Units: "gram", "kilogram", "ounce", "pound", "piece", "slice", "serving", "whole", "half", "cup". 
   -> Example: "200 grams of grilled chicken breast", "1 slice of turkey", "1 cup of diced ham".

SAFETY & FALLBACK PROTOCOLS: 
1. The 100g Fallback: If you cannot confidently estimate the portion visually, default to "100 grams" AND set "portion_guessed": true.
2. Chain of Thought: Briefly explain your spatial reasoning in "visual_reasoning" before outputting the portion.
3. The Rejection Rule: If the image does not contain any identifiable food or beverages (e.g., a steering wheel, a dog, a blank wall), you must return an empty array: { "detected_foods": [] }.

OUTPUT FORMAT:
You must output the final result in JSON format. 
You MUST strictly use the following exact JSON structure and key names. Do not invent your own keys.

{
  "detected_foods": [
    {
      "item_name": "generic food name",
      "visual_reasoning": "brief spatial explanation",
      "estimated_portion": "quantity and unit as a single string (e.g., '1 cup' or '1 whole')",
      "portion_guessed": false
    }
  ]
}
"""
    
    message = HumanMessage(content=[
        {"type": "text", "text": prompt},
        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{state['image_base64']}"}}
    ])

    try:
        # Invoke the model
        result: MealExtraction = structured_llm.invoke([message])
        
        # Rejection Protocol: Check if no foods were found
        if not result.detected_foods:
            return {"error": "No recognizable food found in the image. Please give correct and clearer photo.", "detected_foods": []}
        
        # Convert Pydantic objects to standard dictionaries for the State
        foods_list = [
            {
                "item_name": food.item_name, 
                "visual_reasoning": food.visual_reasoning,
                "estimated_portion": food.estimated_portion,
                "portion_guessed": food.portion_guessed
            } 
            for food in result.detected_foods
            if food.item_name and food.item_name.strip()
        ]

        if not foods_list:
            return {"error": "No recognizable food items with valid names were found. Please try a clearer photo.", "detected_foods": []}

        return {"detected_foods": foods_list, "error": ""}
        
    except Exception as e:
        print(f"Vision API Error: {e}")
        return {"error": "Failed to analyze the image. Please try a clearer photo."}


def calculate_calories_node(state):
    # 1. Check if the vision model threw an error or rejected the image first
    if state.get("error"):
        return state 
        
    foods = state.get("detected_foods", [])
    if not foods:
        return {
            "total_calories": 0, 
            "total_protein": 0, 
            "total_carbs": 0, 
            "total_fat": 0
        }
    
    # 2. Convert the AI's JSON output into the strict list format Edamam needs  
    query_list = []
    for food in foods:
        portion = food.get("estimated_portion", "100 grams")
        name = food.get("item_name", "")
        query_list.append(f"{portion} {name}")
        
    print(f"📡 Sending to Edamam API: {query_list}")
    
    # 3. Securely load your Edamam keys
    app_id = os.getenv("EDAMAM_APP_ID")
    app_key = os.getenv("EDAMAM_APP_KEY")
    
    url = "https://api.edamam.com/api/nutrition-details"
    params = {
        "app_id": app_id,
        "app_key": app_key
    }
    
    payload = {
        "title": "AI Calorie Calculator Meal",
        "ingr": query_list
    }
    
    headers = {"Content-Type": "application/json"}
    
    try:
        # 4. Make the POST request
        response = requests.post(url, params=params, json=payload, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            
            total_cals = 0
            total_protein = 0
            total_carbs = 0
            total_fat = 0
            
            # 5. Extract using your perfected nested loop
            ingredients = data.get("ingredients", [])
            for item in ingredients:
                parsed_list = item.get("parsed", [])
                for parsed_item in parsed_list:
                    nutrients = parsed_item.get("nutrients", {})
                    
                    total_cals += nutrients.get("ENERC_KCAL", {}).get("quantity", 0)
                    total_protein += nutrients.get("PROCNT", {}).get("quantity", 0)
                    total_carbs += nutrients.get("CHOCDF", {}).get("quantity", 0)
                    total_fat += nutrients.get("FAT", {}).get("quantity", 0)
            
            # 6. Return the perfectly calculated macros to the LangGraph state!
            return {
                "total_calories": round(total_cals),
                "total_protein": round(total_protein, 1),
                "total_carbs": round(total_carbs, 1),
                "total_fat": round(total_fat, 1)
            }
            
        elif response.status_code == 555:
            return {"error": "Edamam could not understand the food items or portions. Please try a clearer photo."}
        else:
            return {"error": f"Edamam API Error: {response.status_code}"}
            
    except Exception as e:
        return {"error": f"Failed to connect to Edamam: {e}"}

def build_calorie_graph():
    workflow = StateGraph(CalorieState)
    
    # Add Nodes
    workflow.add_node("vision_detector", detect_food_node)
    workflow.add_node("calculator", calculate_calories_node)
    
    # Define Edges (Chronological automated flow)
    workflow.add_edge(START, "vision_detector")
    workflow.add_edge("vision_detector", "calculator")
    workflow.add_edge("calculator", END)
    
    return workflow.compile()