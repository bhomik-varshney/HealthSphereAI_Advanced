import argparse
import os
import sys
from playwright.sync_api import sync_playwright
from dataclasses import dataclass, asdict, field
import pandas as pd


@dataclass
class Business:
    """Holds hospital data"""
    name: str
    phone_number: str
    website: str
    address: str


@dataclass
class BusinessList:
    """Holds list of Business objects, saves to Excel and CSV"""
    business_list: list = field(default_factory=list)
    save_at = 'output'

    def dataframe(self):
        return pd.DataFrame([asdict(business) for business in self.business_list])

    def save_to_excel(self, filename):
        if not os.path.exists(self.save_at):
            os.makedirs(self.save_at)
        self.dataframe().to_excel(f"output/{filename}.xlsx", index=False)

    def save_to_csv(self, filename):
        if not os.path.exists(self.save_at):
            os.makedirs(self.save_at)
        self.dataframe().to_csv(f"output/{filename}.csv", index=False)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("-s", "--search", type=str, default="hospitals in India", help="Search term for Google Maps.")
    parser.add_argument("-t", "--total", type=int, help="Total number of results to scrape (default is 100).")
    args = parser.parse_args()

    search_list = [args.search] if args.search else ["hospitals in India"]
    total = args.total if args.total else 100

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # Headless mode is faster
        page = browser.new_page()
        
        print("Opening Google Maps...")
        page.goto("https://www.google.com/maps", timeout=60000)
        page.wait_for_timeout(2000)  # Reduced wait time

        for search_for in search_list:
            print(f"Scraping: {search_for}")
            
            # Wait for search box to be visible and ready - try multiple selectors
            try:
                # Try different selectors for the search box
                search_selectors = [
                    'input#searchboxinput',
                    'input[aria-label*="Search"]',
                    'input[name="q"]',
                    '//input[@id="searchboxinput"]'
                ]
                
                search_box = None
                for selector in search_selectors:
                    try:
                        if '//' in selector:
                            search_box = page.locator(selector)
                        else:
                            search_box = page.locator(f'{selector}')
                        search_box.wait_for(state="visible", timeout=10000)
                        print(f"Found search box with selector: {selector}")
                        break
                    except:
                        continue
                
                if search_box is None:
                    print("Could not find search box. Page may not have loaded correctly.")
                    continue
                
                search_box.click()
                page.wait_for_timeout(500)
                search_box.fill(search_for)
                page.keyboard.press("Enter")
                print("Search initiated, waiting for results...")
                page.wait_for_timeout(3000)  # Optimized wait time
            except Exception as e:
                print(f"Error during search: {e}")
                continue

            print("Scrolling to load all results...")
            previously_counted = 0
            scroll_attempts = 0
            max_scroll_attempts = 20
            
            while scroll_attempts < max_scroll_attempts:
                page.mouse.wheel(0, 5000)
                page.wait_for_timeout(1000)  # Faster scrolling
                listings = page.locator('//a[contains(@href, "https://www.google.com/maps/place")]').all()
                if scroll_attempts % 3 == 0:  # Print less frequently
                    print(f"Found {len(listings)} listings so far...")
                
                if len(listings) >= total or len(listings) == previously_counted:
                    break
                previously_counted = len(listings)
                scroll_attempts += 1

            print(f"Total listings found: {len(listings)}, extracting details...")
            business_list = BusinessList()
            for idx, listing in enumerate(listings[:total]):
                try:
                    if idx % 5 == 0:  # Print less frequently
                        print(f"Processing {idx + 1}/{min(total, len(listings))}...")
                    listing.click()
                    page.wait_for_timeout(1000)  # Faster processing

                    business = Business(
                        name=listing.get_attribute('aria-label') or "",
                        phone_number=page.locator(
                            '//button[contains(@data-item-id, "phone:tel:")]//div[contains(@class, "fontBodyMedium")]').inner_text() if page.locator(
                            '//button[contains(@data-item-id, "phone:tel:")]//div[contains(@class, "fontBodyMedium")]').count() > 0 else "",
                        website=page.locator(
                            '//a[@data-item-id="authority"]//div[contains(@class, "fontBodyMedium")]').inner_text() if page.locator(
                            '//a[@data-item-id="authority"]//div[contains(@class, "fontBodyMedium")]').count() > 0 else "",
                        address=page.locator(
                            '//button[@data-item-id="address"]//div[contains(@class, "fontBodyMedium")]').inner_text() if page.locator(
                            '//button[@data-item-id="address"]//div[contains(@class, "fontBodyMedium")]').count() > 0 else ""
                    )
                    business_list.business_list.append(business)
                except Exception as e:
                    print(f'Error occurred while processing listing: {e}')

            print(f"Successfully extracted {len(business_list.business_list)} hospitals")
            print("Saving data...")
            business_list.save_to_excel(f"hospitals_data_{search_for}".replace(' ', '_'))
            business_list.save_to_csv(f"hospitals_data_{search_for}".replace(' ', '_'))
            print("[OK] Data saved successfully!")

        browser.close()
        print("Scraping completed!")


if __name__ == "__main__":
    main()
