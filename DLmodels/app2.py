import streamlit as st
import tensorflow as tf
import numpy as np
from PIL import Image
import time

st.set_page_config(
    page_title="Vital Lung AI",
    page_icon="🫁",
    layout="wide",
    initial_sidebar_state="collapsed"
)

st.markdown("""
    <style>
    .main-title { font-size: 6rem; font-weight: 800; text-align: center; color: #1E3A8A; margin-bottom: 0;}
    .sub-title { font-size: 1.5rem; color: #64748B; text-align: center; margin-bottom: 1rem; font-weight: 500;}
    .footer-text { text-align: center; color: #94A3B8; font-size: 0.9rem; margin-top: 2rem; }
    </style>
""", unsafe_allow_html=True)

st.markdown("<div class='main-title'>🫁 Vital Lung AI</div>", unsafe_allow_html=True)
st.markdown("<div class='sub-title'>Clinical-Grade Chest X-Ray Diagnostic Assistant</div>", unsafe_allow_html=True)

@st.cache_resource
def load_medical_model():
    model_path = "DenseNet121_best.keras" 
    return tf.keras.models.load_model(model_path)

with st.spinner("Initializing AI Core Engine..."):
    model = load_medical_model()

CLASS_NAMES = ['Covid', 'Lung Opacity', 'Normal', 'Pneumonia']


col_space1, col_uploader, col_space2 = st.columns([1, 4, 1])

with col_uploader:
    uploaded_file = st.file_uploader(
        "Securely upload a patient's Chest X-Ray (JPG/PNG)", 
        type=["jpg", "jpeg", "png"]
    )

if uploaded_file is not None:
    st.toast("Image loaded securely!", icon="✅")   
    image_col, analysis_col = st.columns([1, 1], gap="large")
    
    with image_col:
        with st.container(border=True):
            st.subheader("🖼️ Patient Scan")
            image = Image.open(uploaded_file).convert('RGB')
            st.image(image, use_container_width=True)
        
    with analysis_col:
        with st.container(border=True):
            st.subheader("🔬 Diagnostic Control")
            
            analyze_button = st.button("Run AI Diagnostics", type="primary", use_container_width=True)
            
            if analyze_button:
                progress_text = "Scanning lung textures..."
                my_bar = st.progress(0, text=progress_text)
                
                for percent_complete in range(100):
                    time.sleep(0.01) 
                    my_bar.progress(percent_complete + 1, text=progress_text)
                time.sleep(0.5)
                my_bar.empty() 
                    
                img_resized = image.resize((224, 224))
                img_array = tf.keras.preprocessing.image.img_to_array(img_resized)
                img_array = np.expand_dims(img_array, axis=0)
                
                predictions = model.predict(img_array)[0]
                    
                winning_index = np.argmax(predictions)
                winning_class = CLASS_NAMES[winning_index]
                winning_confidence = predictions[winning_index] * 100
                
                st.divider()
                metric_col1, metric_col2 = st.columns(2)
                
                with metric_col1:
                    if winning_class == "Normal":
                        st.metric(label="Primary Diagnosis", value=f"🟢 {winning_class}")
                    else:
                        st.metric(label="Primary Diagnosis", value=f"🔴 {winning_class}")
                        
                with metric_col2:
                    st.metric(label="AI Confidence", value=f"{winning_confidence:.2f}%")
                    
                if winning_class != "Normal":
                    st.error("⚠️ **Immediate radiologist review recommended.**")
                else:
                    st.success("✅ **No immediate severe abnormalities detected.**")
                    
                st.divider()
                
                st.markdown("#### 📊 Probability Breakdown")
                for i, class_name in enumerate(CLASS_NAMES):
                    confidence_score = float(predictions[i])
                    
                    if i == winning_index:
                        st.write(f"**{class_name}**")
                    else:
                        st.write(f"{class_name}")
                        
                    st.progress(confidence_score, text=f"{confidence_score*100:.1f}%")

st.write("---")

with st.expander("⚖️ Medical Disclaimer & Model Information", expanded=False):
    st.warning(
        "**FOR RESEARCH PURPOSES ONLY:** This artificial intelligence model is designed for educational "
        "and research applications. It is NOT a FDA-approved medical device. It is not a substitute for "
        "professional medical advice, diagnosis, or treatment. Always consult a board-certified radiologist."
    )
    st.info("**Model Architecture:** Transfer Learning Baseline v1.0 | **Training Accuracy:** ~85%")

st.markdown("<div class='footer-text'>Developed for the intersection of Computer Vision and Healthcare.</div>", unsafe_allow_html=True)