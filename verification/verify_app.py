from playwright.sync_api import Page, expect, sync_playwright

def test_app_loads_and_renders(page: Page):
  # 1. Arrange: Go to the app.
  page.goto("http://localhost:5173")

  # 2. Act: Click "Generate Random" to load the graph.
  # Using get_by_role for button with "Generate Random" text (approximate)
  # The component says: <h3 className="font-semibold text-slate-700 mb-1">Generate Random</h3> inside a button.
  # So we look for the button containing "Generate Random".
  page.get_by_text("Generate Random").click()

  # 3. Assert: Wait for nodes to appear.
  # Nodes have data-testid="node-..."
  # We'll wait for at least one node.
  node = page.locator("[data-testid^='node-']").first
  expect(node).to_be_visible()

  # 4. Act: Click the node to see details.
  node.click()

  # 5. Assert: Check if details panel opens.
  # Look for "Release Management" text in the sidebar.
  expect(page.get_by_text("Release Management")).to_be_visible()

  # 6. Screenshot: Capture the result.
  page.screenshot(path="verification/app_verification.png")

if __name__ == "__main__":
  with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    try:
      test_app_loads_and_renders(page)
    finally:
      browser.close()
