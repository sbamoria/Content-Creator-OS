from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import asyncio
import resend
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Resend setup
resend.api_key = os.getenv('RESEND_API_KEY')
SENDER_EMAIL = os.getenv('SENDER_EMAIL', 'onboarding@resend.dev')

# JWT settings
JWT_SECRET = os.environ.get('JWT_SECRET', 'secret')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 72

security = HTTPBearer()

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: str
    name: str
    email: str
    created_at: str

class TokenResponse(BaseModel):
    token: str
    user: User

class LandingPageCreate(BaseModel):
    course_name: str
    course_description: str
    instructor_name: str
    target_audience: str
    course_price: float

class LandingPage(BaseModel):
    id: str
    creator_id: str
    course_name: str
    course_description: str
    instructor_name: str
    target_audience: str
    course_price: float
    generated_form_fields: List[Dict[str, Any]]
    created_at: str

class LeadSubmit(BaseModel):
    landing_page_id: str
    responses: Dict[str, Any]

class Lead(BaseModel):
    id: str
    landing_page_id: str
    responses: Dict[str, Any]
    intent_level: Optional[str] = None
    purchased: bool = False
    created_at: str

class Segment(BaseModel):
    id: str
    creator_id: str
    name: str
    intent_filter: Optional[str] = None
    lead_ids: List[str]
    created_at: str

class SegmentCreate(BaseModel):
    name: str
    intent_filter: Optional[str] = None

class EmailCampaign(BaseModel):
    segment_id: str
    subject: str
    html_content: str

class Campaign(BaseModel):
    id: str
    creator_id: str
    segment_id: str
    segment_name: str
    subject: str
    sent_count: int
    created_at: str

class SegmentUpdate(BaseModel):
    name: Optional[str] = None
    intent_filter: Optional[str] = None

class Webinar(BaseModel):
    id: str
    creator_id: str
    landing_page_id: str
    title: str
    description: str
    scheduled_date: str
    created_at: str

class WebinarCreate(BaseModel):
    landing_page_id: str
    title: str
    description: str
    scheduled_date: str

class WebinarSignup(BaseModel):
    lead_id: str

class WebinarAttendee(BaseModel):
    id: str
    webinar_id: str
    lead_id: str
    signed_up_at: str

class FollowUpEmail(BaseModel):
    webinar_id: str
    subject: str
    discount_percent: Optional[float] = 0
    bonus_courses: Optional[str] = ""

class FunnelStats(BaseModel):
    total_leads: int
    high_intent: int
    medium_intent: int
    low_intent: int
    webinar_signups: int
    purchases: int

class AIInsightRequest(BaseModel):
    funnel_stats: Dict[str, Any]
    stage: str

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    payload = {
        'user_id': user_id,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload['user_id']
    except:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

# ==================== AUTH ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "MonetizeFlow API"}

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "name": user_data.name,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id)
    user = User(id=user_id, name=user_data.name, email=user_data.email, created_at=user_doc["created_at"])
    return TokenResponse(token=token, user=user)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc or not verify_password(credentials.password, user_doc["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user_doc["id"])
    user = User(id=user_doc["id"], name=user_doc["name"], email=user_doc["email"], created_at=user_doc["created_at"])
    return TokenResponse(token=token, user=user)

# ==================== LANDING PAGE ROUTES ====================

@api_router.post("/landing-pages", response_model=LandingPage)
async def create_landing_page(data: LandingPageCreate, creator_id: str = Depends(get_current_user)):
    # Use AI to generate form fields
    prompt = f"""You are an expert lead generation consultant. Generate a JSON array of form fields for a lead capture form.
    
Course Details:
- Name: {data.course_name}
- Description: {data.course_description}
- Target Audience: {data.target_audience}
- Price: ${data.course_price}

Generate 5-7 form fields that will help identify high-intent leads. Each field should have:
- "name": field name (lowercase, underscore)
- "label": display label
- "type": "text", "email", "tel", "select", or "textarea"
- "options": array of options (only for select type)
- "required": boolean

Include fields like: name, email, current experience level, budget range, timeline, specific pain points, etc.

Respond ONLY with a valid JSON array, no markdown or explanation."""
    
    try:
        chat = LlmChat(
            api_key=os.getenv('EMERGENT_LLM_KEY'),
            session_id=f"landing_page_{str(uuid.uuid4())}",
            system_message="You are a lead generation expert. Always respond with valid JSON only."
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        
        response = await chat.send_message(UserMessage(text=prompt))
        import json
        # Clean up response - remove markdown if present
        clean_response = response.strip()
        if clean_response.startswith('```'):
            lines = clean_response.split('\n')
            clean_response = '\n'.join(lines[1:-1]) if len(lines) > 2 else clean_response
        
        generated_fields = json.loads(clean_response)
    except Exception as e:
        logger.error(f"AI generation error: {str(e)}")
        # Fallback to default fields
        generated_fields = [
            {"name": "full_name", "label": "Full Name", "type": "text", "required": True},
            {"name": "email", "label": "Email", "type": "email", "required": True},
            {"name": "phone", "label": "Phone Number", "type": "tel", "required": False},
            {"name": "experience_level", "label": "Experience Level", "type": "select", "options": ["Beginner", "Intermediate", "Advanced"], "required": True},
            {"name": "budget", "label": "Budget Range", "type": "select", "options": ["Under $500", "$500-$1000", "$1000-$2000", "$2000+"], "required": True},
            {"name": "goals", "label": "What are your main goals?", "type": "textarea", "required": True}
        ]
    
    landing_page_id = str(uuid.uuid4())
    landing_page_doc = {
        "id": landing_page_id,
        "creator_id": creator_id,
        "course_name": data.course_name,
        "course_description": data.course_description,
        "instructor_name": data.instructor_name,
        "target_audience": data.target_audience,
        "course_price": data.course_price,
        "generated_form_fields": generated_fields,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.landing_pages.insert_one(landing_page_doc)
    
    return LandingPage(**landing_page_doc)

@api_router.get("/landing-pages", response_model=List[LandingPage])
async def get_landing_pages(creator_id: str = Depends(get_current_user)):
    pages = await db.landing_pages.find({"creator_id": creator_id}, {"_id": 0}).to_list(100)
    return [LandingPage(**page) for page in pages]

@api_router.get("/landing-pages/{page_id}", response_model=LandingPage)
async def get_landing_page(page_id: str):
    page = await db.landing_pages.find_one({"id": page_id}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Landing page not found")
    return LandingPage(**page)

# ==================== LEAD ROUTES ====================

@api_router.post("/leads", response_model=Lead)
async def submit_lead(data: LeadSubmit):
    # Verify landing page exists
    page = await db.landing_pages.find_one({"id": data.landing_page_id}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Landing page not found")
    
    lead_id = str(uuid.uuid4())
    lead_doc = {
        "id": lead_id,
        "landing_page_id": data.landing_page_id,
        "responses": data.responses,
        "intent_level": None,
        "purchased": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.leads.insert_one(lead_doc)
    
    return Lead(**lead_doc)

@api_router.get("/leads", response_model=List[Lead])
async def get_leads(landing_page_id: Optional[str] = None, intent_level: Optional[str] = None, creator_id: str = Depends(get_current_user)):
    # Get creator's landing pages
    pages = await db.landing_pages.find({"creator_id": creator_id}, {"_id": 0, "id": 1}).to_list(100)
    page_ids = [p["id"] for p in pages]
    
    query = {"landing_page_id": {"$in": page_ids}}
    if landing_page_id:
        query["landing_page_id"] = landing_page_id
    if intent_level:
        query["intent_level"] = intent_level
    
    leads = await db.leads.find(query, {"_id": 0}).to_list(1000)
    return [Lead(**lead) for lead in leads]

@api_router.post("/leads/classify")
async def classify_leads(creator_id: str = Depends(get_current_user)):
    # Get all leads for creator's landing pages
    pages = await db.landing_pages.find({"creator_id": creator_id}, {"_id": 0, "id": 1, "course_price": 1}).to_list(100)
    page_ids = [p["id"] for p in pages]
    page_prices = {p["id"]: p.get("course_price", 0) for p in pages}
    
    leads = await db.leads.find({"landing_page_id": {"$in": page_ids}, "intent_level": None}, {"_id": 0}).to_list(1000)
    
    if not leads:
        return {"message": "No unclassified leads found", "count": 0}
    
    # Classify leads using AI with stricter criteria
    classified = {"high": 0, "medium": 0, "low": 0}
    
    for lead in leads:
        course_price = page_prices.get(lead['landing_page_id'], 0)
        
        prompt = f"""You are a strict lead qualification expert. Classify this lead's purchase intent as 'high', 'medium', or 'low'.

Course Price: ${course_price}
Lead Responses: {lead['responses']}

STRICT CRITERIA:
HIGH intent (only ~20% of leads):
- Budget significantly exceeds course price OR explicitly mentions high budget tier
- Timeline is "immediately" or "within 1 week"
- Detailed, specific goals showing deep understanding of needs
- Advanced experience level seeking to level up

MEDIUM intent (~50% of leads):
- Budget aligns with course price OR mid-range budget option
- Timeline is "within 1 month" or "2-3 months"
- Clear but general goals
- Intermediate experience level

LOW intent (~30% of leads):
- Budget well below course price OR lowest budget option
- Timeline is vague, "someday", or "6+ months"
- Vague goals or just browsing
- Complete beginner with no urgency

Be CRITICAL and REALISTIC. Most leads are medium or low intent.
Respond with ONLY one word: high, medium, or low"""
        
        try:
            chat = LlmChat(
                api_key=os.getenv('EMERGENT_LLM_KEY'),
                session_id=f"classify_{lead['id']}",
                system_message="You are a strict lead qualification expert. Be critical and realistic. Only 20% should be high intent."
            ).with_model("anthropic", "claude-sonnet-4-5-20250929")
            
            response = await chat.send_message(UserMessage(text=prompt))
            intent_level = response.strip().lower()
            
            if intent_level not in ['high', 'medium', 'low']:
                intent_level = 'medium'
            
            classified[intent_level] += 1
            
            await db.leads.update_one(
                {"id": lead["id"]},
                {"$set": {"intent_level": intent_level}}
            )
        except Exception as e:
            logger.error(f"Classification error for lead {lead['id']}: {str(e)}")
            await db.leads.update_one(
                {"id": lead["id"]},
                {"$set": {"intent_level": "medium"}}
            )
            classified["medium"] += 1
    
    return {
        "message": f"Classified {len(leads)} leads",
        "count": len(leads),
        "breakdown": classified
    }

# ==================== SEGMENT ROUTES ====================

@api_router.post("/segments", response_model=Segment)
async def create_segment(data: SegmentCreate, creator_id: str = Depends(get_current_user)):
    # Get leads based on filter
    pages = await db.landing_pages.find({"creator_id": creator_id}, {"_id": 0, "id": 1}).to_list(100)
    page_ids = [p["id"] for p in pages]
    
    query = {"landing_page_id": {"$in": page_ids}}
    if data.intent_filter:
        query["intent_level"] = data.intent_filter
    
    leads = await db.leads.find(query, {"_id": 0, "id": 1}).to_list(1000)
    lead_ids = [lead["id"] for lead in leads]
    
    segment_id = str(uuid.uuid4())
    segment_doc = {
        "id": segment_id,
        "creator_id": creator_id,
        "name": data.name,
        "intent_filter": data.intent_filter,
        "lead_ids": lead_ids,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.segments.insert_one(segment_doc)
    
    return Segment(**segment_doc)

@api_router.get("/segments", response_model=List[Segment])
async def get_segments(creator_id: str = Depends(get_current_user)):
    segments = await db.segments.find({"creator_id": creator_id}, {"_id": 0}).to_list(100)
    return [Segment(**seg) for seg in segments]

@api_router.put("/segments/{segment_id}", response_model=Segment)
async def update_segment(segment_id: str, data: SegmentUpdate, creator_id: str = Depends(get_current_user)):
    # Get existing segment
    segment = await db.segments.find_one({"id": segment_id, "creator_id": creator_id}, {"_id": 0})
    if not segment:
        raise HTTPException(status_code=404, detail="Segment not found")
    
    # Update fields
    update_data = {}
    if data.name:
        update_data["name"] = data.name
    if data.intent_filter is not None:
        update_data["intent_filter"] = data.intent_filter
        
        # Refresh lead_ids based on new filter
        pages = await db.landing_pages.find({"creator_id": creator_id}, {"_id": 0, "id": 1}).to_list(100)
        page_ids = [p["id"] for p in pages]
        
        query = {"landing_page_id": {"$in": page_ids}}
        if data.intent_filter:
            query["intent_level"] = data.intent_filter
        
        leads = await db.leads.find(query, {"_id": 0, "id": 1}).to_list(1000)
        update_data["lead_ids"] = [lead["id"] for lead in leads]
    
    await db.segments.update_one({"id": segment_id}, {"$set": update_data})
    
    updated_segment = await db.segments.find_one({"id": segment_id}, {"_id": 0})
    return Segment(**updated_segment)

# ==================== EMAIL CAMPAIGN ROUTES ====================

@api_router.post("/campaigns/broadcast")
async def send_broadcast_email(campaign: EmailCampaign, creator_id: str = Depends(get_current_user)):
    # Get segment
    segment = await db.segments.find_one({"id": campaign.segment_id, "creator_id": creator_id}, {"_id": 0})
    if not segment:
        raise HTTPException(status_code=404, detail="Segment not found")
    
    # Get leads
    leads = await db.leads.find({"id": {"$in": segment["lead_ids"]}}, {"_id": 0}).to_list(1000)
    
    sent_count = 0
    failed_count = 0
    
    for lead in leads:
        email = lead["responses"].get("email") or lead["responses"].get("email_address")
        if email:
            try:
                params = {
                    "from": SENDER_EMAIL,
                    "to": [email],
                    "subject": campaign.subject,
                    "html": campaign.html_content
                }
                await asyncio.to_thread(resend.Emails.send, params)
                sent_count += 1
            except Exception as e:
                logger.error(f"Email send error to {email}: {str(e)}")
                failed_count += 1
    
    # Save campaign record
    campaign_id = str(uuid.uuid4())
    campaign_doc = {
        "id": campaign_id,
        "creator_id": creator_id,
        "segment_id": campaign.segment_id,
        "segment_name": segment["name"],
        "subject": campaign.subject,
        "sent_count": sent_count,
        "failed_count": failed_count,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.campaigns.insert_one(campaign_doc)
    
    return {
        "message": f"Campaign sent to {sent_count} leads" + (f" ({failed_count} failed)" if failed_count > 0 else ""),
        "sent_count": sent_count,
        "failed_count": failed_count
    }

@api_router.get("/campaigns", response_model=List[Campaign])
async def get_campaigns(creator_id: str = Depends(get_current_user)):
    campaigns = await db.campaigns.find({"creator_id": creator_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return [Campaign(**c) for c in campaigns]

# ==================== WEBINAR ROUTES ====================

@api_router.post("/webinars", response_model=Webinar)
async def create_webinar(data: WebinarCreate, creator_id: str = Depends(get_current_user)):
    # Verify landing page belongs to creator
    page = await db.landing_pages.find_one({"id": data.landing_page_id, "creator_id": creator_id}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Landing page not found")
    
    webinar_id = str(uuid.uuid4())
    webinar_doc = {
        "id": webinar_id,
        "creator_id": creator_id,
        "landing_page_id": data.landing_page_id,
        "title": data.title,
        "description": data.description,
        "scheduled_date": data.scheduled_date,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.webinars.insert_one(webinar_doc)
    
    return Webinar(**webinar_doc)

@api_router.get("/webinars", response_model=List[Webinar])
async def get_webinars(landing_page_id: Optional[str] = None, creator_id: str = Depends(get_current_user)):
    query = {"creator_id": creator_id}
    if landing_page_id:
        query["landing_page_id"] = landing_page_id
    
    webinars = await db.webinars.find(query, {"_id": 0}).to_list(100)
    return [Webinar(**w) for w in webinars]

@api_router.get("/webinars/{webinar_id}", response_model=Webinar)
async def get_webinar(webinar_id: str):
    webinar = await db.webinars.find_one({"id": webinar_id}, {"_id": 0})
    if not webinar:
        raise HTTPException(status_code=404, detail="Webinar not found")
    return Webinar(**webinar)

@api_router.post("/webinars/{webinar_id}/signup", response_model=WebinarAttendee)
async def signup_for_webinar(webinar_id: str, data: WebinarSignup):
    webinar = await db.webinars.find_one({"id": webinar_id}, {"_id": 0})
    if not webinar:
        raise HTTPException(status_code=404, detail="Webinar not found")
    
    # Check if already signed up
    existing = await db.webinar_attendees.find_one({"webinar_id": webinar_id, "lead_id": data.lead_id}, {"_id": 0})
    if existing:
        return WebinarAttendee(**existing)
    
    attendee_id = str(uuid.uuid4())
    attendee_doc = {
        "id": attendee_id,
        "webinar_id": webinar_id,
        "lead_id": data.lead_id,
        "signed_up_at": datetime.now(timezone.utc).isoformat()
    }
    await db.webinar_attendees.insert_one(attendee_doc)
    
    return WebinarAttendee(**attendee_doc)

@api_router.get("/webinars/{webinar_id}/attendees", response_model=List[WebinarAttendee])
async def get_webinar_attendees(webinar_id: str, creator_id: str = Depends(get_current_user)):
    # Verify webinar belongs to creator
    webinar = await db.webinars.find_one({"id": webinar_id, "creator_id": creator_id}, {"_id": 0})
    if not webinar:
        raise HTTPException(status_code=404, detail="Webinar not found")
    
    attendees = await db.webinar_attendees.find({"webinar_id": webinar_id}, {"_id": 0}).to_list(1000)
    return [WebinarAttendee(**a) for a in attendees]

# ==================== POST-WEBINAR FOLLOW-UP ====================

@api_router.post("/campaigns/webinar-followup")
async def send_webinar_followup(data: FollowUpEmail, creator_id: str = Depends(get_current_user)):
    # Verify webinar belongs to creator
    webinar = await db.webinars.find_one({"id": data.webinar_id, "creator_id": creator_id}, {"_id": 0})
    if not webinar:
        raise HTTPException(status_code=404, detail="Webinar not found")
    
    # Get attendees who didn't purchase
    attendees = await db.webinar_attendees.find({"webinar_id": data.webinar_id}, {"_id": 0}).to_list(1000)
    attendee_lead_ids = [a["lead_id"] for a in attendees]
    
    non_purchasers = await db.leads.find({
        "id": {"$in": attendee_lead_ids},
        "purchased": False
    }, {"_id": 0}).to_list(1000)
    
    # Personalize email with discount and bonus
    sent_count = 0
    for lead in non_purchasers:
        email = lead["responses"].get("email")
        name = lead["responses"].get("full_name", "there")
        
        if email:
            html_content = f"""<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Hi {name},</h2>
                <p>{data.subject}</p>
                <p>We noticed you attended our webinar but haven't enrolled yet.</p>
                {f'<p><strong>Special Offer: {data.discount_percent}% OFF</strong></p>' if data.discount_percent else ''}
                {f'<p><strong>Bonus: {data.bonus_courses}</strong></p>' if data.bonus_courses else ''}
                <p>Don\'t miss this opportunity!</p>
                <p>Best regards,<br>{webinar['title']} Team</p>
            </div>"""
            
            try:
                params = {
                    "from": SENDER_EMAIL,
                    "to": [email],
                    "subject": data.subject,
                    "html": html_content
                }
                await asyncio.to_thread(resend.Emails.send, params)
                sent_count += 1
            except Exception as e:
                logger.error(f"Followup email error to {email}: {str(e)}")
    
    return {"message": f"Follow-up emails sent to {sent_count} non-purchasers", "sent_count": sent_count}

# ==================== ANALYTICS ROUTES ====================

@api_router.get("/analytics/funnel", response_model=FunnelStats)
async def get_funnel_stats(landing_page_id: Optional[str] = None, creator_id: str = Depends(get_current_user)):
    # Get creator's landing pages
    pages_query = {"creator_id": creator_id}
    if landing_page_id:
        pages_query["id"] = landing_page_id
    
    pages = await db.landing_pages.find(pages_query, {"_id": 0, "id": 1}).to_list(100)
    page_ids = [p["id"] for p in pages]
    
    # Get leads
    leads = await db.leads.find({"landing_page_id": {"$in": page_ids}}, {"_id": 0}).to_list(10000)
    
    total_leads = len(leads)
    high_intent = sum(1 for l in leads if l.get("intent_level") == "high")
    medium_intent = sum(1 for l in leads if l.get("intent_level") == "medium")
    low_intent = sum(1 for l in leads if l.get("intent_level") == "low")
    purchases = sum(1 for l in leads if l.get("purchased", False))
    
    # Get webinar signups
    lead_ids = [l["id"] for l in leads]
    attendees = await db.webinar_attendees.find({"lead_id": {"$in": lead_ids}}, {"_id": 0}).to_list(10000)
    webinar_signups = len(attendees)
    
    return FunnelStats(
        total_leads=total_leads,
        high_intent=high_intent,
        medium_intent=medium_intent,
        low_intent=low_intent,
        webinar_signups=webinar_signups,
        purchases=purchases
    )

@api_router.post("/analytics/insights")
async def get_ai_insights(data: AIInsightRequest, creator_id: str = Depends(get_current_user)):
    prompt = f"""You are a conversion optimization expert analyzing a creator's sales funnel.

Funnel Stage: {data.stage}
Stats: {data.funnel_stats}

Provide ONE actionable insight (max 2 sentences) to improve this stage. Be specific and data-driven.

Respond with plain text only, no markdown."""
    
    try:
        chat = LlmChat(
            api_key=os.getenv('EMERGENT_LLM_KEY'),
            session_id=f"insight_{str(uuid.uuid4())}",
            system_message="You are a conversion optimization expert. Provide brief, actionable insights."
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        
        response = await chat.send_message(UserMessage(text=prompt))
        insight = response.strip()
    except Exception as e:
        logger.error(f"AI insight error: {str(e)}")
        insight = "Consider A/B testing your messaging to improve conversion at this stage."
    
    return {"insight": insight}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
