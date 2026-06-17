import pandas as pd
import subprocess
import streamlit as st
import folium
from streamlit_folium import st_folium
import requests
import os
from pathlib import Path

st.html(f"""<h1 style = "font-size:50px;margin-top:0px;margin-bottom:0px;text-align:center;font-family: 'Georgia', serif;
    font-weight: bold;">Hospital Finder</h1>""")
if "selectbox" not in st.session_state:
    st.session_state["select_box"] = None
if "latitude" not in st.session_state:
    st.session_state["latitude"] = None
if "latitude" not in st.session_state:
        st.session_state["latitude"] = None


with st.sidebar:
    st.title("Features")
    select_Box = st.selectbox("Select search mode",options=["Manual","Use Map 🔥"], label_visibility="collapsed")
    st.session_state["select_box"] = select_Box
    st.caption(f"The Hospital Finder app extracts hospital details from Google Maps, providing names, addresses, contact numbers, and websites. It enables fast, automated searches across locations, ensuring easy access to healthcare facilities. With CSV and Excel exports, users can efficiently store and analyze hospital data for informed decision-making. ")
st.markdown("<style>.st-emotion-cache-b0y9n5 {border:none}</style>",unsafe_allow_html=True)
# Get user input for the location

st.markdown("<style>.st-emotion-cache-1tvzk6f { border-radius: 25px; border: 2px solid rgb(277,66,52)}</style>",unsafe_allow_html=True)


def find_hospitals(location, message):
    if not location:
        st.error("Please enter a location!")
        return
    
    if not location.strip():
        st.error("Location cannot be empty!")
        return
    
    # Show status
    status_placeholder = st.empty()
    progress_placeholder = st.empty()
    
    status_placeholder.info(f"🔍 Scraping hospitals data for: **{location}**")
    
    # Get the project root directory
    project_root = Path(__file__).parent.parent
    scraper_path = project_root / "scraper.py"
    
    # Use the conda environment Python
    python_exe = r"C:\Users\siddh\anaconda3\envs\minor_upd_venv\python.exe"
    
    if not os.path.exists(python_exe):
        st.error(f"❌ Python executable not found at: {python_exe}")
        st.error("Please ensure conda environment 'minor_upd_venv' is properly installed.")
        return
    
    if not os.path.exists(scraper_path):
        st.error(f"❌ Scraper script not found at: {scraper_path}")
        return
    
    with st.spinner("Opening browser and searching Google Maps..."):
        search_query = f"hospitals {message} {location}"
        command = f'"{python_exe}" "{scraper_path}" -s "{search_query}" -t 50'
        
        try:
            # Change to project root directory for scraper execution
            process = subprocess.run(
                command, 
                shell=True, 
                capture_output=True, 
                text=True,
                cwd=str(project_root)
            )
        except Exception as e:
            st.error(f"❌ Failed to run scraper: {str(e)}")
            return
    
    # Show scraper output if available
    if process.stdout:
        with st.expander("📋 View Scraping Details"):
            st.code(process.stdout, language="text")
    
    if process.returncode != 0:
        st.error("⚠️ Scraper encountered an error. Please try again.")
        if process.stderr:
            with st.expander("Error Details"):
                st.code(process.stderr, language="text")
        return
    
    status_placeholder.success("✅ Scraping completed!")
    
    st.caption(f"**Results: Hospitals {message} {location}**")
    
    # Search for the output file with flexible name matching
    output_dir = project_root / "output"
    
    # List all files in output directory for debugging
    if not output_dir.exists():
        st.error("❌ Output directory not found!")
        return
    
    all_csv_files = list(output_dir.glob("*.csv"))
    
    if not all_csv_files:
        st.error("❌ No CSV files found in output directory. The scraper may not have completed successfully.")
        return
    
    # Try exact match first: look for files containing the location
    search_pattern = f"hospitals_data_*{location.replace(' ', '_')}*.csv"
    matching_files = list(output_dir.glob(search_pattern))
    
    # If not found, try with lowercase
    if not matching_files:
        search_pattern = f"hospitals_data_*{location.lower().replace(' ', '_')}*.csv"
        matching_files = list(output_dir.glob(search_pattern))
    
    # If still not found, try with the search query pattern (full search term)
    if not matching_files:
        full_search_query = f"hospitals {message} {location}".replace(' ', '_')
        search_pattern = f"hospitals_data_{full_search_query}*.csv"
        matching_files = list(output_dir.glob(search_pattern))
    
    # Last resort: use the most recently modified CSV file
    if not matching_files:
        all_csv_files_sorted = sorted(all_csv_files, key=lambda p: p.stat().st_mtime, reverse=True)
        if all_csv_files_sorted:
            matching_files = [all_csv_files_sorted[0]]
            st.warning(f"⚠️ Using most recent file: {matching_files[0].name}")
    
    if not matching_files:
        with st.expander("🔍 Debug Info - Available CSV Files"):
            st.write("CSV files in output directory:")
            for f in all_csv_files:
                st.write(f"- {f.name}")
        st.error("❌ No matching hospitals data found. Please try again with a different location.")
        return
    
    file_path = matching_files[0]
    
    try:
        data = pd.read_csv(file_path, encoding='utf-8')
        if data.empty:
            st.warning("No hospitals found in this area. Try a different location.")
        else:
            st.dataframe(data, use_container_width=True)
            st.success(f"📊 Found {len(data)} hospitals!")
            
            # Add download buttons
            csv_data = data.to_csv(index=False)
            st.download_button(
                label="📥 Download CSV",
                data=csv_data,
                file_name=f"hospitals_{location.replace(' ', '_')}.csv",
                mime="text/csv"
            )
    except pd.errors.EmptyDataError:
        st.error("❌ There is no such place or you have entered wrong location.")
    except UnicodeDecodeError:
        try:
            data = pd.read_csv(file_path, encoding='latin-1')
            st.dataframe(data, use_container_width=True)
            st.success(f"📊 Found {len(data)} hospitals!")
            csv_data = data.to_csv(index=False)
            st.download_button(
                label="📥 Download CSV",
                data=csv_data,
                file_name=f"hospitals_{location.replace(' ', '_')}.csv",
                mime="text/csv"
            )
        except Exception as e:
            st.error(f"❌ Encoding error reading data: {str(e)}")
    except Exception as e:
        st.error(f"❌ An error occurred while reading the data: {str(e)}")
def get_address(lat, lon):
    try:
        url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json"
        headers = {"User-Agent": "HealthSphere-Hospital-Finder/1.0"}

        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            address = data.get("display_name", None)
            if address:
                return address
        return None
    except Exception as e:
        return None

if st.session_state["select_box"] == "Use Map 🔥":
    st.caption("Get Landmark")
    m = folium.Map(location=[28.679079, 77.069710], zoom_start=10)

    folium.Marker([28.679079, 77.069710], popup="Delhi", tooltip="Delhi").add_to(m)

    st_data = st_folium(m, width=725)

    if st_data and "last_clicked" in st_data and st_data["last_clicked"]:
        st.session_state["latitude"] = st_data["last_clicked"]["lat"]
        st.session_state["longitude"] = st_data["last_clicked"]["lng"]
    if st.session_state["latitude"] is not None and st.button("Find Hospitals"):
        address = get_address(st.session_state["latitude"], st.session_state["longitude"])
        if address:
            st.success(f"📍 Location: {address}")
            find_hospitals(address,"in or near")
        else:
            st.error("Unable to fetch address for the selected location. Please try clicking on a different location or use Manual search instead.")



if st.session_state["select_box"] == "Manual":
    location = st.text_input("Enter the city or location to search for hospitals:")
    if st.button("Find Hospitals"):
        find_hospitals(location,"in or near")







