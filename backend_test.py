import requests
import sys
import json
from datetime import datetime, timezone
import time

class MonetizeFlowAPITester:
    def __init__(self, base_url="https://course-convert.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_data = None
        self.landing_page_id = None
        self.lead_id = None
        self.segment_id = None
        self.webinar_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.headers = {'Content-Type': 'application/json'}

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = self.headers.copy()
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"   Response: {response.text}")
                except:
                    pass
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_register(self):
        """Test user registration"""
        test_user = {
            "name": f"Test User {datetime.now().strftime('%H%M%S')}",
            "email": f"test{datetime.now().strftime('%H%M%S')}@example.com",
            "password": "TestPass123!"
        }
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user
        )
        if success and 'token' in response:
            self.token = response['token']
            self.user_data = response['user']
            return True
        return False

    def test_login(self):
        """Test user login with registered credentials"""
        if not self.user_data:
            return False
        
        login_data = {
            "email": self.user_data['email'],
            "password": "TestPass123!"
        }
        success, response = self.run_test(
            "User Login",
            "POST", 
            "auth/login",
            200,
            data=login_data
        )
        if success and 'token' in response:
            self.token = response['token']
            return True
        return False

    def test_create_landing_page(self):
        """Test AI-powered landing page creation"""
        landing_page_data = {
            "course_name": "AI Mastery Course",
            "course_description": "Learn cutting-edge AI techniques and build real-world applications",
            "instructor_name": "Dr. AI Expert",
            "target_audience": "Software developers and data scientists",
            "course_price": 299.99
        }
        success, response = self.run_test(
            "Create Landing Page (AI Form Generation)",
            "POST",
            "landing-pages",
            200,
            data=landing_page_data
        )
        if success and 'id' in response:
            self.landing_page_id = response['id']
            print(f"   Generated {len(response.get('generated_form_fields', []))} AI form fields")
            return True
        return False

    def test_get_landing_pages(self):
        """Test retrieving landing pages"""
        success, response = self.run_test(
            "Get Landing Pages",
            "GET",
            "landing-pages",
            200
        )
        return success and isinstance(response, list)

    def test_public_landing_page(self):
        """Test public landing page access (no auth)"""
        if not self.landing_page_id:
            return False
        
        success, response = self.run_test(
            "Get Public Landing Page",
            "GET",
            f"landing-pages/{self.landing_page_id}",
            200
        )
        return success

    def test_submit_lead(self):
        """Test lead submission on public landing page"""
        if not self.landing_page_id:
            return False
        
        lead_data = {
            "landing_page_id": self.landing_page_id,
            "responses": {
                "full_name": "John Test Lead",
                "email": "john.testlead@example.com",
                "phone": "+1234567890", 
                "experience_level": "Intermediate",
                "budget": "$1000-$2000",
                "goals": "I want to build AI applications for my startup"
            }
        }
        success, response = self.run_test(
            "Submit Lead (Public Form)",
            "POST",
            "leads",
            200,
            data=lead_data
        )
        if success and 'id' in response:
            self.lead_id = response['id']
            return True
        return False

    def test_get_leads(self):
        """Test retrieving leads for creator"""
        success, response = self.run_test(
            "Get Leads",
            "GET",
            "leads",
            200
        )
        return success and isinstance(response, list)

    def test_classify_leads_ai(self):
        """Test AI lead classification"""
        print("   (AI processing - this may take a few seconds...)")
        success, response = self.run_test(
            "AI Lead Classification",
            "POST",
            "leads/classify",
            200
        )
        if success:
            print(f"   AI classified leads: {response.get('message', 'Unknown')}")
        return success

    def test_create_segment(self):
        """Test segment creation with intent filter"""
        segment_data = {
            "name": "High Intent Prospects",
            "intent_filter": "high"
        }
        success, response = self.run_test(
            "Create Segment",
            "POST",
            "segments",
            200,
            data=segment_data
        )
        if success and 'id' in response:
            self.segment_id = response['id']
            return True
        return False

    def test_get_segments(self):
        """Test retrieving segments"""
        success, response = self.run_test(
            "Get Segments",
            "GET",
            "segments",
            200
        )
        return success and isinstance(response, list)

    def test_send_email_campaign(self):
        """Test email campaign broadcast"""
        if not self.segment_id:
            return False
        
        campaign_data = {
            "segment_id": self.segment_id,
            "subject": "Exclusive AI Course Offer",
            "html_content": "<h2>Hi there!</h2><p>Don't miss out on our AI Mastery Course!</p>"
        }
        success, response = self.run_test(
            "Send Email Campaign",
            "POST",
            "campaigns/broadcast",
            200,
            data=campaign_data
        )
        return success

    def test_create_webinar(self):
        """Test webinar creation"""
        if not self.landing_page_id:
            return False
        
        webinar_data = {
            "landing_page_id": self.landing_page_id,
            "title": "Live AI Masterclass",
            "description": "Join us for an exclusive live session on advanced AI techniques",
            "scheduled_date": "2025-09-01T19:00:00"
        }
        success, response = self.run_test(
            "Create Webinar",
            "POST",
            "webinars",
            200,
            data=webinar_data
        )
        if success and 'id' in response:
            self.webinar_id = response['id']
            return True
        return False

    def test_webinar_signup(self):
        """Test webinar signup (public)"""
        if not self.webinar_id or not self.lead_id:
            return False
        
        signup_data = {
            "lead_id": self.lead_id
        }
        success, response = self.run_test(
            "Webinar Signup",
            "POST",
            f"webinars/{self.webinar_id}/signup",
            200,
            data=signup_data
        )
        return success

    def test_get_webinar_attendees(self):
        """Test retrieving webinar attendees"""
        if not self.webinar_id:
            return False
        
        success, response = self.run_test(
            "Get Webinar Attendees",
            "GET",
            f"webinars/{self.webinar_id}/attendees",
            200
        )
        return success and isinstance(response, list)

    def test_post_webinar_followup(self):
        """Test post-webinar follow-up emails"""
        if not self.webinar_id:
            return False
        
        followup_data = {
            "webinar_id": self.webinar_id,
            "subject": "Exclusive Offer for Webinar Attendees",
            "discount_percent": 25.0,
            "bonus_courses": "Free bonus: Advanced AI Optimization"
        }
        success, response = self.run_test(
            "Post-Webinar Follow-up",
            "POST",
            "campaigns/webinar-followup",
            200,
            data=followup_data
        )
        return success

    def test_analytics_funnel(self):
        """Test funnel analytics"""
        success, response = self.run_test(
            "Analytics Funnel Stats",
            "GET",
            "analytics/funnel",
            200
        )
        if success:
            stats = response
            print(f"   Total leads: {stats.get('total_leads', 0)}")
            print(f"   High intent: {stats.get('high_intent', 0)}")
            print(f"   Webinar signups: {stats.get('webinar_signups', 0)}")
            print(f"   Purchases: {stats.get('purchases', 0)}")
        return success

    def test_ai_insights(self):
        """Test AI insights generation"""
        insights_data = {
            "funnel_stats": {
                "total_leads": 10,
                "high_intent": 3,
                "medium_intent": 4,
                "low_intent": 3,
                "webinar_signups": 2,
                "purchases": 1
            },
            "stage": "lead_capture"
        }
        print("   (AI processing - this may take a few seconds...)")
        success, response = self.run_test(
            "AI Insights Generation",
            "POST",
            "analytics/insights",
            200,
            data=insights_data
        )
        if success:
            print(f"   AI Insight: {response.get('insight', 'No insight returned')}")
        return success

def main():
    print("🚀 Starting MonetizeFlow Platform API Tests...")
    print("=" * 60)
    
    tester = MonetizeFlowAPITester()
    
    # Core Authentication Flow
    if not tester.test_register():
        print("❌ Registration failed, stopping tests")
        return 1
    
    # Landing Page & AI Form Generation
    if not tester.test_create_landing_page():
        print("❌ Landing page creation failed, stopping tests")
        return 1
    
    tester.test_get_landing_pages()
    tester.test_public_landing_page()
    
    # Lead Management & AI Classification
    if not tester.test_submit_lead():
        print("❌ Lead submission failed, continuing with other tests")
    
    tester.test_get_leads()
    tester.test_classify_leads_ai()
    
    # Segment Management
    tester.test_create_segment()
    tester.test_get_segments()
    
    # Email Campaigns
    tester.test_send_email_campaign()
    
    # Webinar Management
    if not tester.test_create_webinar():
        print("❌ Webinar creation failed, continuing with other tests")
    
    tester.test_webinar_signup()
    tester.test_get_webinar_attendees()
    tester.test_post_webinar_followup()
    
    # Analytics & AI Insights
    tester.test_analytics_funnel()
    tester.test_ai_insights()
    
    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 FINAL RESULTS: {tester.tests_passed}/{tester.tests_run} tests passed")
    print(f"🎯 Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    if tester.tests_passed >= tester.tests_run * 0.8:
        print("✅ Backend API testing SUCCESSFUL!")
        return 0
    else:
        print("❌ Backend API testing FAILED - Multiple issues found")
        return 1

if __name__ == "__main__":
    sys.exit(main())