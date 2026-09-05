import random
from datetime import timedelta, time
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone

from apps.providers.models import ProviderProfile, ServiceListing, AvailabilitySlot, AvailabilityBlock
from apps.bookings.models import Booking
from apps.reviews.models import Review
from apps.payments.models import PaymentTransaction, PayoutRecord
from apps.notifications.models import Notification

User = get_user_model()

TUTORS_DATA = [
    {
        "first_name": "Elena",
        "last_name": "Rostova",
        "email": "elena.rostova@example.com",
        "headline": "Stanford PhD | AP Calculus, Linear Algebra & Multivariable Math",
        "bio": "Hi! I am a Stanford mathematics graduate with 7+ years of experience helping high school and university students master calculus, real analysis, and discrete math. My teaching philosophy focuses on visual intuition before rigorous formal proofs.",
        "hourly_rate": 65.00,
        "city": "San Francisco",
        "state": "CA",
        "skills": ["Calculus BC", "Linear Algebra", "Differential Equations", "Statistics"],
        "languages": ["English", "Russian"],
        "category": "mathematics",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
        "is_featured": True,
        "services": [
            {"title": "1-on-1 Calculus Mastery (Single Session)", "price": 65.00, "duration": 60, "category": "mathematics", "description": "Focused problem solving on derivative techniques, integration by parts, or series convergence."},
            {"title": "Comprehensive College Linear Algebra Coaching", "price": 95.00, "duration": 90, "category": "mathematics", "description": "Deep dive into vector spaces, eigenvalues, matrix transformations, and SVD decomposition."},
            {"title": "AP Calculus Exam Intensive Prep", "price": 120.00, "duration": 120, "category": "mathematics", "description": "Timed practice exams, scoring rubric breakdown, and common trap identification."}
        ]
    },
    {
        "first_name": "div",
        "last_name": "tutor",
        "email": "div-tutor@tutorconnect.com",  # Primary demo tutor account (div-tutor)
        "headline": "FAANG Senior Staff SWE & Mentor | Full-Stack React, Python & System Design",
        "bio": "Over 9 years in industry building scalable cloud distributed systems. I mentor aspiring software engineers and university CS students through Data Structures, LeetCode algorithms, Python, and React architecture.",
        "hourly_rate": 80.00,
        "city": "Seattle",
        "state": "WA",
        "skills": ["Python", "Algorithms & LeetCode", "React / TypeScript", "System Design"],
        "languages": ["English"],
        "category": "computer_science",
        "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
        "is_featured": True,
        "services": [
            {"title": "Coding Interview & LeetCode Prep", "price": 80.00, "duration": 60, "category": "computer_science", "description": "Mock technical interview with live feedback on complexity analysis, edge cases, and code cleaniness."},
            {"title": "Full-Stack Project Architecture Review", "price": 115.00, "duration": 90, "category": "computer_science", "description": "Code review of your React/Django or Node project, debugging bottlenecks, and CI/CD best practices."},
            {"title": "Intro to Python for Beginners", "price": 60.00, "duration": 60, "category": "computer_science", "description": "Start coding from scratch: syntax, OOP concepts, file handling, and basic APIs."}
        ]
    },
    {
        "first_name": "Sophia",
        "last_name": "Chen",
        "email": "sophia.chen@example.com",
        "headline": "Johns Hopkins Pre-Med Alum | Organic Chemistry & Molecular Biology",
        "bio": "Organic Chemistry doesn't have to be a nightmare. I break down reaction mechanisms, arrow pushing, and stereochemistry into intuitive mental patterns. Helped 80+ students score in the 95th percentile.",
        "hourly_rate": 70.00,
        "city": "Boston",
        "state": "MA",
        "skills": ["Organic Chemistry", "Biochemistry", "MCAT Biology", "Genetics"],
        "languages": ["English", "Mandarin"],
        "category": "sciences",
        "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
        "is_featured": True,
        "services": [
            {"title": "Organic Chemistry Reaction Mechanism Workshop", "price": 70.00, "duration": 60, "category": "sciences", "description": "Master SN1/SN2/E1/E2 mechanisms and synthesis pathways step by step."},
            {"title": "MCAT Biological Foundations Boot Camp", "price": 135.00, "duration": 120, "category": "sciences", "description": "Passage breakdown strategies and high-yield biochemistry concept drills."}
        ]
    },
    {
        "first_name": "David",
        "last_name": "Miller",
        "email": "david.miller@example.com",
        "headline": "Perfect 1600 SAT Scorer | Ivy League Admissions Strategy & SAT Prep",
        "bio": "Harvard '21. Tutored over 150 students with an average score increase of +190 points on the Digital SAT. We focus on reading passage deconstruction, speed math tactics, and grammar elimination heuristics.",
        "hourly_rate": 90.00,
        "city": "New York",
        "state": "NY",
        "skills": ["Digital SAT Prep", "ACT Prep", "College Essay Editing", "Critical Reading"],
        "languages": ["English"],
        "category": "test_prep",
        "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
        "is_featured": True,
        "services": [
            {"title": "Digital SAT Reading & Writing Mastery", "price": 90.00, "duration": 60, "category": "test_prep", "description": "Target tricky vocabulary in context, transition questions, and inference logic."},
            {"title": "SAT Math 800 Target Session", "price": 90.00, "duration": 60, "category": "test_prep", "description": "Desmos calculator tricks, geometry shortcuts, and hard algebra problem solving."}
        ]
    },
    {
        "first_name": "Amina",
        "last_name": "Diallo",
        "email": "amina.diallo@example.com",
        "headline": "Sorbonne Master's | Conversational & Business French (Native Speaker)",
        "bio": "Bonjour! I am a Parisian native teaching French from beginner basics (A1) to business fluency (C2). Lessons are dynamic, interactive, and customized around your cultural and career goals.",
        "hourly_rate": 50.00,
        "city": "Austin",
        "state": "TX",
        "skills": ["French", "DELF/DALF Prep", "Business French", "Pronunciation"],
        "languages": ["French", "English"],
        "category": "languages",
        "avatar_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400",
        "is_featured": False,
        "services": [
            {"title": "Interactive Conversational French Practice", "price": 50.00, "duration": 60, "category": "languages", "description": "Practice spontaneous conversation, correct accent nuances, and expand idiomatic vocabulary."},
            {"title": "DELF B2 / DALF C1 Exam Preparation", "price": 75.00, "duration": 90, "category": "languages", "description": "Structured practice with listening comprehension, essay writing, and oral presentation."}
        ]
    },
    {
        "first_name": "Julian",
        "last_name": "Kowalski",
        "email": "julian.kowalski@example.com",
        "headline": "Juilliard Classical Pianist | Classical Piano & Music Theory",
        "bio": "Concert pianist with 12 years of performance experience. Whether you want to learn Chopin nocturnes, read sheet music effortlessly, or pass ABRSM exams, I tailor every lesson to your personal pace.",
        "hourly_rate": 75.00,
        "city": "Chicago",
        "state": "IL",
        "skills": ["Classical Piano", "Music Theory", "ABRSM Exam Prep", "Sight Reading"],
        "languages": ["English", "Polish"],
        "category": "music",
        "avatar_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400",
        "is_featured": False,
        "services": [
            {"title": "Piano Technique & Repertoire Coaching", "price": 75.00, "duration": 60, "category": "music", "description": "Finger articulation, pedal control, musical phrasing, and custom repertoire development."},
            {"title": "Practical Music Theory & Ear Training", "price": 55.00, "duration": 60, "category": "music", "description": "Harmony, chord progressions, circle of fifths, and interval ear training for all instruments."}
        ]
    },
    {
        "first_name": "Priya",
        "last_name": "Nair",
        "email": "priya.nair@example.com",
        "headline": "MIT Physics Graduate | AP Physics 1, 2, C & Quantum Mechanics",
        "bio": "Physics explains the mechanics of the universe! I specialize in turning difficult differential equation physics problems into clear, step-by-step visualizations. Patient, encouraging, and methodical.",
        "hourly_rate": 65.00,
        "city": "San Jose",
        "state": "CA",
        "skills": ["AP Physics C", "Classical Mechanics", "Electromagnetism", "Thermodynamics"],
        "languages": ["English", "Hindi"],
        "category": "sciences",
        "avatar_url": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=400",
        "is_featured": False,
        "services": [
            {"title": "AP Physics C Mechanics & E&M Deep Dive", "price": 65.00, "duration": 60, "category": "sciences", "description": "Rotational dynamics, Gauss's Law, Maxwell equations, and lab question strategies."}
        ]
    }
]

REVIEWS_POOL = [
    {"rating": 5, "comment": "Outstanding tutor! Explained complex concepts in 20 minutes that my professor couldn't clarify all semester. Highly recommended!"},
    {"rating": 5, "comment": "Truly exceptional pedagogy. Patient, methodical, and provides great follow-up notes after each session."},
    {"rating": 5, "comment": "Helped my score jump significantly in just 4 weeks. Best investment in my education I have made all year."},
    {"rating": 4, "comment": "Very knowledgeable and structured. Would definitely book again for final exam prep."},
    {"rating": 5, "comment": "Great communication, clear diagrams on the shared whiteboard, and very engaging lesson."},
]

class Command(BaseCommand):
    help = "Seed database with rich demo data for TutorConnect (tutors, clients, bookings, reviews, earnings)"

    def handle(self, *args, **options):
        self.stdout.write("Starting TutorConnect demo data seeding...")

        # 1. Create Superuser / Admin
        admin, created = User.objects.get_or_create(
            email="admin@tutorconnect.com",
            defaults={
                "first_name": "Admin",
                "last_name": "User",
                "is_staff": True,
                "is_superuser": True,
                "email_verified": True,
                "is_client": True,
                "is_provider": True,
            }
        )
        if created:
            admin.set_password("Password123!")
            admin.save()
            self.stdout.write(self.style.SUCCESS("Created admin: admin@tutorconnect.com (Password123!)"))

        # 2. Create Demo Client (div-student)
        demo_client, created = User.objects.get_or_create(
            email="div-student@tutorconnect.com",
            defaults={
                "first_name": "div",
                "last_name": "student",
                "is_client": True,
                "is_provider": False,
                "email_verified": True,
                "avatar_url": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400",
                "bio": "div-student preparing for tech interviews, algorithms, and university coursework."
            }
        )
        demo_client.set_password("Password123!")
        demo_client.save()
        self.stdout.write(self.style.SUCCESS("Created demo client: div-student (div-student@tutorconnect.com / Password123!)"))

        # Also support client@tutorconnect.com alias
        old_client, _ = User.objects.get_or_create(
            email="client@tutorconnect.com",
            defaults={
                "first_name": "div",
                "last_name": "student",
                "is_client": True,
                "is_provider": False,
                "email_verified": True,
            }
        )
        old_client.set_password("Password123!")
        old_client.save()

        # 3. Create Additional Clients for social proof
        other_clients = []
        client_names = [
            ("Liam", "Smith", "liam.s@example.com"),
            ("Emma", "Watson", "emma.w@example.com"),
            ("Noah", "Brown", "noah.b@example.com"),
            ("Olivia", "Taylor", "olivia.t@example.com"),
        ]
        for fn, ln, em in client_names:
            u, _ = User.objects.get_or_create(
                email=em,
                defaults={
                    "first_name": fn,
                    "last_name": ln,
                    "is_client": True,
                    "email_verified": True,
                }
            )
            u.set_password("Password123!")
            u.save()
            other_clients.append(u)

        all_clients = [demo_client] + other_clients

        # 4. Create Tutors & Profiles
        now = timezone.now()
        created_tutors = []

        for data in TUTORS_DATA:
            u, created = User.objects.get_or_create(
                email=data["email"],
                defaults={
                    "first_name": data["first_name"],
                    "last_name": data["last_name"],
                    "is_provider": True,
                    "is_client": True,
                    "email_verified": True,
                    "avatar_url": data["avatar_url"],
                    "bio": data["bio"],
                }
            )
            if created or data["email"] in ["tutor@tutorconnect.com", "div-tutor@tutorconnect.com"]:
                u.set_password("Password123!")
                u.save()

            profile, _ = ProviderProfile.objects.get_or_create(
                user=u,
                defaults={
                    "headline": data["headline"],
                    "bio": data["bio"],
                    "hourly_rate": Decimal(str(data["hourly_rate"])),
                    "city": data["city"],
                    "state": data["state"],
                    "skills": data["skills"],
                    "languages": data["languages"],
                    "is_active": True,
                    "is_featured": data.get("is_featured", False),
                    "offers_online": True,
                    "offers_in_person": True,
                }
            )
            created_tutors.append(profile)

            # Create Service Listings
            for svc_data in data["services"]:
                ServiceListing.objects.get_or_create(
                    provider=profile,
                    title=svc_data["title"],
                    defaults={
                        "price": Decimal(str(svc_data["price"])),
                        "duration_minutes": svc_data["duration"],
                        "category": svc_data["category"],
                        "description": svc_data["description"],
                        "is_paused": False,
                    }
                )

            # Create Recurring Weekly Availability Slots (Mon - Fri 09:00 to 17:00)
            for day in range(5):
                AvailabilitySlot.objects.get_or_create(
                    provider=profile,
                    day_of_week=day,
                    start_time=time(9, 0),
                    end_time=time(13, 0),
                    defaults={"is_active": True}
                )
                AvailabilitySlot.objects.get_or_create(
                    provider=profile,
                    day_of_week=day,
                    start_time=time(14, 0),
                    end_time=time(18, 0),
                    defaults={"is_active": True}
                )

            # Create a one-off block next week
            AvailabilityBlock.objects.get_or_create(
                provider=profile,
                date=(now + timedelta(days=12)).date(),
                defaults={"all_day": True, "reason": "Academic Conference"}
            )

        self.stdout.write(self.style.SUCCESS(f"Seeded {len(created_tutors)} provider profiles with services & recurring slots."))

        # 5. Create Past Completed Bookings & Reviews for all tutors
        primary_tutor = created_tutors[1]  # Marcus Vance (tutor@tutorconnect.com)

        for tutor in created_tutors:
            services = list(tutor.services.all())
            if not services:
                continue

            # Past completed bookings
            for past_day in [20, 15, 10, 5, 2]:
                client = random.choice(all_clients)
                service = random.choice(services)
                b_start = now - timedelta(days=past_day, hours=random.randint(2, 6))
                b_end = b_start + timedelta(minutes=service.duration_minutes)

                booking, b_created = Booking.objects.get_or_create(
                    client=client,
                    provider=tutor,
                    service=service,
                    start_time=b_start,
                    defaults={
                        "end_time": b_end,
                        "total_price": service.price,
                        "status": "COMPLETED",
                        "is_paid": True,
                        "stripe_payment_intent_id": f"pi_mock_{random.randint(100000, 999999)}",
                        "notes": "Focused review session"
                    }
                )

                if b_created:
                    # Create Payment Transaction (gross, 10% fee, 90% net)
                    fee = round(service.price * Decimal('0.10'), 2)
                    net = service.price - fee
                    PaymentTransaction.objects.create(
                        booking=booking,
                        amount=service.price,
                        fee_amount=fee,
                        net_amount=net,
                        status="SUCCEEDED",
                        created_at=b_start
                    )

                    # Create Verified Review
                    review_item = random.choice(REVIEWS_POOL)
                    Review.objects.create(
                        booking=booking,
                        client=client,
                        provider=tutor,
                        rating=review_item["rating"],
                        comment=review_item["comment"],
                        created_at=b_end + timedelta(hours=1)
                    )

            # 6. Create Upcoming Bookings
            upcoming_times = [
                (now + timedelta(days=1, hours=2)),
                (now + timedelta(days=3, hours=5)),
                (now + timedelta(days=6, hours=1)),
            ]
            for u_start in upcoming_times:
                client = random.choice(all_clients)
                service = random.choice(services)
                u_end = u_start + timedelta(minutes=service.duration_minutes)

                Booking.objects.get_or_create(
                    client=client,
                    provider=tutor,
                    service=service,
                    start_time=u_start,
                    defaults={
                        "end_time": u_end,
                        "total_price": service.price,
                        "status": "CONFIRMED",
                        "is_paid": True,
                        "stripe_payment_intent_id": f"pi_mock_{random.randint(100000, 999999)}",
                        "notes": "Looking forward to working through the problem sets!"
                    }
                )

        # 7. Create Demo Notifications for the Demo Users
        Notification.objects.create(
            recipient=demo_client,
            title="Welcome to TutorConnect!",
            message="Explore top-rated tutors across mathematics, coding, sciences, and test prep.",
            notification_type="general",
            action_url="/tutors"
        )
        Notification.objects.create(
            recipient=demo_client,
            title="Session Confirmed",
            message="Your session with Marcus Vance for 'Coding Interview & LeetCode Prep' is confirmed.",
            notification_type="booking_confirmed",
            action_url="/dashboard/client"
        )

        Notification.objects.create(
            recipient=primary_tutor.user,
            title="Welcome to TutorConnect Provider Hub!",
            message="Your weekly schedule is active. Customize your rates, services, and availability anytime.",
            notification_type="general",
            action_url="/dashboard/provider"
        )

        self.stdout.write(self.style.SUCCESS("TutorConnect demo data seeded successfully!"))
        self.stdout.write(self.style.SUCCESS("Demo accounts ready:"))
        self.stdout.write(" - Student:  div-student@tutorconnect.com (div-student) / Password123!")
        self.stdout.write(" - Tutor:    div-tutor@tutorconnect.com (div-tutor)     / Password123!")
        self.stdout.write(" - Admin:    admin@tutorconnect.com                     / Password123!")
