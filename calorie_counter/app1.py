import streamlit as st
import base64
from graph1 import build_calorie_graph

# Configure the Streamlit page
st.set_page_config(
    page_title="AI Calorie Calculator", 
    page_icon="🥗", 
    layout="centered"
)

st.title("📸 AI Calorie & Macro Calculator")
st.markdown("Upload a photo of your meal. Our **Llama 4 Vision AI** will identify the ingredients, and **Edamam's AI** will calculate the exact nutritional breakdown.")

# Initialize the LangGraph application
# (Doing this outside the button ensures it doesn't rebuild every click)
app = build_calorie_graph()

# Create the file uploader
uploaded_file = st.file_uploader("Choose an image of your food...", type=["jpg", "jpeg", "png"])

if uploaded_file is not None:
    # Display the uploaded image cleanly
    st.image(uploaded_file, caption="Your Meal", use_container_width=True)
    
    st.divider() # Adds a clean visual break
    
    # The submission button
    if st.button("Calculate Macros 🚀", type="primary", use_container_width=True):
        with st.spinner("AI is analyzing your image and fetching nutritional data..."):
            
            # Convert the uploaded image to a Base64 string
            base64_img = base64.b64encode(uploaded_file.getvalue()).decode('utf-8')
            
            # Define the initial state for LangGraph
            initial_state = {
                "image_base64": base64_img, 
                "detected_foods": [], 
                "total_calories": 0, 
                "total_protein": 0.0,
                "total_carbs": 0.0,
                "total_fat": 0.0,
                "error": ""
            }
            
            try:
                # Execute the LangGraph pipeline
                result_state = app.invoke(initial_state)
                
                # Render the results
                if result_state.get("error"):
                    # This gracefully handles the "Rejection Protocol" or Edamam 555 errors
                    st.error(f"⚠️ {result_state['error']}")
                else:
                    st.success("Analysis Complete!")
                    
                    # --- BEAUTIFUL METRICS DISPLAY ---
                    st.markdown("### 📊 Nutritional Breakdown")
                    
                    # Create 4 evenly spaced columns for a dashboard look
                    col1, col2, col3, col4 = st.columns(4)
                    
                    with col1:
                        st.metric(label="🔥 Calories", value=f"{result_state.get('total_calories', 0)} kcal")
                    with col2:
                        st.metric(label="💪 Protein", value=f"{result_state.get('total_protein', 0)} g")
                    with col3:
                        st.metric(label="🍞 Carbs", value=f"{result_state.get('total_carbs', 0)} g")
                    with col4:
                        st.metric(label="🥑 Fat", value=f"{result_state.get('total_fat', 0)} g")
                        
                    st.divider()
                    
                    # --- DETECTED ITEMS LIST WITH WARNINGS ---
                    st.markdown("### 🥗 Detected Items")
                    
                    for item in result_state.get("detected_foods", []):
                        portion = item.get("estimated_portion", "100 grams")
                        name = item.get("item_name", "Unknown item").title()
                        is_guessed = item.get("portion_guessed", False)
                        reasoning = item.get("visual_reasoning", "No reasoning provided.")
                        
                        # Apply smart UI formatting using standard Markdown instead of HTML
                        if is_guessed:
                            st.warning(f"⚠️ **{portion}** {name} *(Portion or brand estimated)* \n\n*AI Logic: {reasoning}*")
                        else:
                            st.success(f"✅ **{portion}** {name} \n\n*AI Logic: {reasoning}*")

                    # --- RAW JSON EXPANDER ---
                    with st.expander("⚙️ View Raw AI Data"):
                        st.json(result_state)
                        
            except Exception as e:
                st.error(f"An unexpected error occurred: {e}")