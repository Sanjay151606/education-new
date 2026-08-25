from sqlalchemy.orm import Session
from .models import AssessmentItem

FULL_SEED_ITEMS = [
    # ==================== SECTION A: Reading & Listening ====================
    # Read-Aloud Items (1-18)
    {
        "id": "sec-a-ra-1",
        "section": "A",
        "item_type": "read_aloud",
        "sequence_index": 1,
        "prompt_text": "The sun rises in the east and sets in the west every single day.",
        "time_limit_seconds": 15,
        "difficulty": "easy"
    },
    {
        "id": "sec-a-ra-2",
        "section": "A",
        "item_type": "read_aloud",
        "sequence_index": 2,
        "prompt_text": "Regular physical exercise improves cardiovascular health and boosts mental energy.",
        "time_limit_seconds": 15,
        "difficulty": "easy"
    },
    {
        "id": "sec-a-ra-3",
        "section": "A",
        "item_type": "read_aloud",
        "sequence_index": 3,
        "prompt_text": "Technology has transformed the way people communicate across global distances.",
        "time_limit_seconds": 15,
        "difficulty": "easy"
    },
    {
        "id": "sec-a-ra-4",
        "section": "A",
        "item_type": "read_aloud",
        "sequence_index": 4,
        "prompt_text": "Reading books expands vocabulary and develops critical thinking skills.",
        "time_limit_seconds": 15,
        "difficulty": "easy"
    },
    {
        "id": "sec-a-ra-5",
        "section": "A",
        "item_type": "read_aloud",
        "sequence_index": 5,
        "prompt_text": "Clean water and sanitation are fundamental requirements for human well-being.",
        "time_limit_seconds": 15,
        "difficulty": "easy"
    },
    {
        "id": "sec-a-ra-6",
        "section": "A",
        "item_type": "read_aloud",
        "sequence_index": 6,
        "prompt_text": "Renewable energy sources like solar and wind power help reduce carbon emissions.",
        "time_limit_seconds": 20,
        "difficulty": "medium"
    },
    {
        "id": "sec-a-ra-7",
        "section": "A",
        "item_type": "read_aloud",
        "sequence_index": 7,
        "prompt_text": "Effective teamwork requires clear communication, active listening, and mutual respect.",
        "time_limit_seconds": 20,
        "difficulty": "medium"
    },
    {
        "id": "sec-a-ra-8",
        "section": "A",
        "item_type": "read_aloud",
        "sequence_index": 8,
        "prompt_text": "Scientific research provides evidence-based solutions to complex environmental challenges.",
        "time_limit_seconds": 20,
        "difficulty": "medium"
    },
    {
        "id": "sec-a-ra-9",
        "section": "A",
        "item_type": "read_aloud",
        "sequence_index": 9,
        "prompt_text": "Financial literacy enables individuals to make informed decisions about budgeting and saving.",
        "time_limit_seconds": 20,
        "difficulty": "medium"
    },
    {
        "id": "sec-a-ra-10",
        "section": "A",
        "item_type": "read_aloud",
        "sequence_index": 10,
        "prompt_text": "Cultural diversity enriches society by introducing varied perspectives, traditions, and art forms.",
        "time_limit_seconds": 20,
        "difficulty": "medium"
    },
    {
        "id": "sec-a-ra-11",
        "section": "A",
        "item_type": "read_aloud",
        "sequence_index": 11,
        "prompt_text": "Architectural innovations in urban planning emphasize sustainability, green spaces, and efficient transport.",
        "time_limit_seconds": 25,
        "difficulty": "medium"
    },
    {
        "id": "sec-a-ra-12",
        "section": "A",
        "item_type": "read_aloud",
        "sequence_index": 12,
        "prompt_text": "Digital privacy regulations aim to protect consumer data against unauthorized commercial exploitation.",
        "time_limit_seconds": 25,
        "difficulty": "medium"
    },
    {
        "id": "sec-a-ra-13",
        "section": "A",
        "item_type": "read_aloud",
        "sequence_index": 13,
        "prompt_text": "Biodiversity conservation is essential to maintaining ecological balance and resilient ecosystems.",
        "time_limit_seconds": 25,
        "difficulty": "hard"
    },
    {
        "id": "sec-a-ra-14",
        "section": "A",
        "item_type": "read_aloud",
        "sequence_index": 14,
        "prompt_text": "Artificial intelligence algorithms analyze vast datasets to identify subtle patterns and forecast economic trends.",
        "time_limit_seconds": 25,
        "difficulty": "hard"
    },
    {
        "id": "sec-a-ra-15",
        "section": "A",
        "item_type": "read_aloud",
        "sequence_index": 15,
        "prompt_text": "Philosophical inquiries into human consciousness explore the interplay between biological neural networks and subjective experience.",
        "time_limit_seconds": 30,
        "difficulty": "hard"
    },
    {
        "id": "sec-a-ra-16",
        "section": "A",
        "item_type": "read_aloud",
        "sequence_index": 16,
        "prompt_text": "Space exploration missions provide valuable technological spinoffs that benefit terrestrial medicine and materials science.",
        "time_limit_seconds": 30,
        "difficulty": "hard"
    },
    {
        "id": "sec-a-ra-17",
        "section": "A",
        "item_type": "read_aloud",
        "sequence_index": 17,
        "prompt_text": "Macroeconomic stabilization policies attempt to balance inflation control with sustainable employment growth.",
        "time_limit_seconds": 30,
        "difficulty": "hard"
    },
    {
        "id": "sec-a-ra-18",
        "section": "A",
        "item_type": "read_aloud",
        "sequence_index": 18,
        "prompt_text": "Interdisciplinary collaboration accelerates discoveries by synthesizing methodologies from physics, biology, and computer engineering.",
        "time_limit_seconds": 30,
        "difficulty": "hard"
    },

    # Listen-and-Repeat Items (19-23)
    {
        "id": "sec-a-lr-19",
        "section": "A",
        "item_type": "listen_repeat",
        "sequence_index": 19,
        "prompt_text": "Please submit your assignment before midnight.",
        "correct_answer": "Please submit your assignment before midnight",
        "time_limit_seconds": 15,
        "difficulty": "easy"
    },
    {
        "id": "sec-a-lr-20",
        "section": "A",
        "item_type": "listen_repeat",
        "sequence_index": 20,
        "prompt_text": "The library will be closed for holiday maintenance this weekend.",
        "correct_answer": "The library will be closed for holiday maintenance this weekend",
        "time_limit_seconds": 15,
        "difficulty": "medium"
    },
    {
        "id": "sec-a-lr-21",
        "section": "A",
        "item_type": "listen_repeat",
        "sequence_index": 21,
        "prompt_text": "Students are encouraged to participate in extracurricular academic workshops.",
        "correct_answer": "Students are encouraged to participate in extracurricular academic workshops",
        "time_limit_seconds": 15,
        "difficulty": "medium"
    },
    {
        "id": "sec-a-lr-22",
        "section": "A",
        "item_type": "listen_repeat",
        "sequence_index": 22,
        "prompt_text": "Innovative solutions require creative problem solving and analytical thinking.",
        "correct_answer": "Innovative solutions require creative problem solving and analytical thinking",
        "time_limit_seconds": 20,
        "difficulty": "hard"
    },
    {
        "id": "sec-a-lr-23",
        "section": "A",
        "item_type": "listen_repeat",
        "sequence_index": 23,
        "prompt_text": "The conference keynote address focused on sustainable agricultural practices in developing nations.",
        "correct_answer": "The conference keynote address focused on sustainable agricultural practices in developing nations",
        "time_limit_seconds": 20,
        "difficulty": "hard"
    },

    # ==================== SECTION B: Speaking Topics (4 Topics) ====================
    {
        "id": "sec-b-topic-1",
        "section": "B",
        "item_type": "speaking_task",
        "sequence_index": 1,
        "prompt_text": "Describe a memorable vacation or trip you took with family or friends.",
        "hints": [
            "Where did you go and who went with you?",
            "What activities did you enjoy the most?",
            "Why was this trip particularly special or memorable?"
        ],
        "display_seconds": 90, # 90s prep phase
        "time_limit_seconds": 60, # 60s speaking recording phase
        "difficulty": "medium"
    },
    {
        "id": "sec-b-topic-2",
        "section": "B",
        "item_type": "speaking_task",
        "sequence_index": 2,
        "prompt_text": "Discuss an important goal you set for yourself and how you achieved it.",
        "hints": [
            "What was the specific goal you wanted to accomplish?",
            "What obstacles or challenges did you encounter?",
            "How did achieving this goal impact your personal growth?"
        ],
        "display_seconds": 90,
        "time_limit_seconds": 60,
        "difficulty": "medium"
    },
    {
        "id": "sec-b-topic-3",
        "section": "B",
        "item_type": "speaking_task",
        "sequence_index": 3,
        "prompt_text": "Should online learning replace traditional classroom education? Share your view.",
        "hints": [
            "What are the major advantages of online education?",
            "What unique benefits does in-person classroom learning offer?",
            "What is your ultimate recommendation for future education?"
        ],
        "display_seconds": 90,
        "time_limit_seconds": 60,
        "difficulty": "hard"
    },
    {
        "id": "sec-b-topic-4",
        "section": "B",
        "item_type": "speaking_task",
        "sequence_index": 4,
        "prompt_text": "Describe a person who has strongly influenced your career or life choices.",
        "hints": [
            "Who is this person and how do you know them?",
            "What specific qualities or actions inspired you?",
            "How have you applied their advice in your own life?"
        ],
        "display_seconds": 90,
        "time_limit_seconds": 60,
        "difficulty": "medium"
    },

    # ==================== SECTION C: Grammar MCQs (34 Questions) ====================
    # Verb Forms (1-7)
    {
        "id": "sec-c-g-1", "section": "C", "item_type": "grammar_mcq", "sequence_index": 1,
        "prompt_text": "She _____ to the market yesterday morning.",
        "options": ["go", "went", "gone", "going"], "correct_answer": "went", "difficulty": "easy"
    },
    {
        "id": "sec-c-g-2", "section": "C", "item_type": "grammar_mcq", "sequence_index": 2,
        "prompt_text": "They have _____ their homework already.",
        "options": ["finish", "finishing", "finished", "finishes"], "correct_answer": "finished", "difficulty": "easy"
    },
    {
        "id": "sec-c-g-3", "section": "C", "item_type": "grammar_mcq", "sequence_index": 3,
        "prompt_text": "If I _____ rich, I would travel around the world.",
        "options": ["am", "was", "were", "been"], "correct_answer": "were", "difficulty": "medium"
    },
    {
        "id": "sec-c-g-4", "section": "C", "item_type": "grammar_mcq", "sequence_index": 4,
        "prompt_text": "The teacher made us _____ the essay twice.",
        "options": ["rewrite", "to rewrite", "rewriting", "rewritten"], "correct_answer": "rewrite", "difficulty": "medium"
    },
    {
        "id": "sec-c-g-5", "section": "C", "item_type": "grammar_mcq", "sequence_index": 5,
        "prompt_text": "Would you mind _____ the window, please?",
        "options": ["open", "to open", "opening", "opened"], "correct_answer": "opening", "difficulty": "medium"
    },
    {
        "id": "sec-c-g-6", "section": "C", "item_type": "grammar_mcq", "sequence_index": 6,
        "prompt_text": "By the time we arrived, the movie had already _____.",
        "options": ["began", "begin", "begun", "beginning"], "correct_answer": "begun", "difficulty": "medium"
    },
    {
        "id": "sec-c-g-7", "section": "C", "item_type": "grammar_mcq", "sequence_index": 7,
        "prompt_text": "She is accustomed to _____ early in the morning.",
        "options": ["wake up", "waking up", "woke up", "woken up"], "correct_answer": "waking up", "difficulty": "hard"
    },

    # Tenses (8-14)
    {
        "id": "sec-c-g-8", "section": "C", "item_type": "grammar_mcq", "sequence_index": 8,
        "prompt_text": "Look! The children _____ in the garden.",
        "options": ["play", "are playing", "played", "have played"], "correct_answer": "are playing", "difficulty": "easy"
    },
    {
        "id": "sec-c-g-9", "section": "C", "item_type": "grammar_mcq", "sequence_index": 9,
        "prompt_text": "We _____ in this city since 2015.",
        "options": ["live", "are living", "have been living", "lived"], "correct_answer": "have been living", "difficulty": "medium"
    },
    {
        "id": "sec-c-g-10", "section": "C", "item_type": "grammar_mcq", "sequence_index": 10,
        "prompt_text": "Next year at this time, I _____ in college.",
        "options": ["will study", "will be studying", "studied", "have studied"], "correct_answer": "will be studying", "difficulty": "medium"
    },
    {
        "id": "sec-c-g-11", "section": "C", "item_type": "grammar_mcq", "sequence_index": 11,
        "prompt_text": "When the lights went out, I _____ a book.",
        "options": ["read", "was reading", "have read", "am reading"], "correct_answer": "was reading", "difficulty": "medium"
    },
    {
        "id": "sec-c-g-12", "section": "C", "item_type": "grammar_mcq", "sequence_index": 12,
        "prompt_text": "He usually _____ coffee in the morning.",
        "options": ["drink", "drinks", "is drinking", "drank"], "correct_answer": "drinks", "difficulty": "easy"
    },
    {
        "id": "sec-c-g-13", "section": "C", "item_type": "grammar_mcq", "sequence_index": 13,
        "prompt_text": "I will call you as soon as I _____ home.",
        "options": ["arrive", "will arrive", "arrived", "am arriving"], "correct_answer": "arrive", "difficulty": "medium"
    },
    {
        "id": "sec-c-g-14", "section": "C", "item_type": "grammar_mcq", "sequence_index": 14,
        "prompt_text": "She promised that she _____ me the next day.",
        "options": ["helps", "will help", "would help", "has helped"], "correct_answer": "would help", "difficulty": "hard"
    },

    # Articles (15-20)
    {
        "id": "sec-c-g-15", "section": "C", "item_type": "grammar_mcq", "sequence_index": 15,
        "prompt_text": "Honesty is _____ best policy.",
        "options": ["a", "an", "the", "no article needed"], "correct_answer": "the", "difficulty": "easy"
    },
    {
        "id": "sec-c-g-16", "section": "C", "item_type": "grammar_mcq", "sequence_index": 16,
        "prompt_text": "Copper is _____ useful metal.",
        "options": ["a", "an", "the", "no article needed"], "correct_answer": "a", "difficulty": "medium"
    },
    {
        "id": "sec-c-g-17", "section": "C", "item_type": "grammar_mcq", "sequence_index": 17,
        "prompt_text": "He met _____ European tourist at the museum.",
        "options": ["a", "an", "the", "no article needed"], "correct_answer": "a", "difficulty": "medium"
    },
    {
        "id": "sec-c-g-18", "section": "C", "item_type": "grammar_mcq", "sequence_index": 18,
        "prompt_text": "They crossed _____ Atlantic Ocean by ship.",
        "options": ["a", "an", "the", "no article needed"], "correct_answer": "the", "difficulty": "easy"
    },
    {
        "id": "sec-c-g-19", "section": "C", "item_type": "grammar_mcq", "sequence_index": 19,
        "prompt_text": "_____ Mount Everest is the highest peak in the world.",
        "options": ["A", "An", "The", "No article needed"], "correct_answer": "No article needed", "difficulty": "medium"
    },
    {
        "id": "sec-c-g-20", "section": "C", "item_type": "grammar_mcq", "sequence_index": 20,
        "prompt_text": "She wants to become _____ engineer.",
        "options": ["a", "an", "the", "no article needed"], "correct_answer": "an", "difficulty": "easy"
    },

    # Voice Change (21-27)
    {
        "id": "sec-c-g-21", "section": "C", "item_type": "grammar_mcq", "sequence_index": 21,
        "prompt_text": "Passive of: 'The chef prepares delicious meals.'",
        "options": [
            "Delicious meals are prepared by the chef.",
            "Delicious meals were prepared by the chef.",
            "Delicious meals have been prepared by the chef.",
            "Delicious meals are being prepared by the chef."
        ],
        "correct_answer": "Delicious meals are prepared by the chef.", "difficulty": "easy"
    },
    {
        "id": "sec-c-g-22", "section": "C", "item_type": "grammar_mcq", "sequence_index": 22,
        "prompt_text": "Passive of: 'They built the bridge in 1995.'",
        "options": [
            "The bridge is built in 1995.",
            "The bridge was built in 1995.",
            "The bridge had built in 1995.",
            "The bridge was building in 1995."
        ],
        "correct_answer": "The bridge was built in 1995.", "difficulty": "easy"
    },
    {
        "id": "sec-c-g-23", "section": "C", "item_type": "grammar_mcq", "sequence_index": 23,
        "prompt_text": "Passive of: 'Someone is repairing the car.'",
        "options": [
            "The car is repaired.",
            "The car was repaired.",
            "The car is being repaired.",
            "The car has been repaired."
        ],
        "correct_answer": "The car is being repaired.", "difficulty": "medium"
    },
    {
        "id": "sec-c-g-24", "section": "C", "item_type": "grammar_mcq", "sequence_index": 24,
        "prompt_text": "Passive of: 'Who wrote Hamlet?'",
        "options": [
            "By whom Hamlet was written?",
            "By whom was Hamlet written?",
            "Who was Hamlet written by?",
            "Hamlet was written by whom?"
        ],
        "correct_answer": "By whom was Hamlet written?", "difficulty": "medium"
    },
    {
        "id": "sec-c-g-25", "section": "C", "item_type": "grammar_mcq", "sequence_index": 25,
        "prompt_text": "Passive of: 'Open the gate.'",
        "options": [
            "Let the gate open.",
            "Let the gate be opened.",
            "The gate should open.",
            "Open should be the gate."
        ],
        "correct_answer": "Let the gate be opened.", "difficulty": "medium"
    },
    {
        "id": "sec-c-g-26", "section": "C", "item_type": "grammar_mcq", "sequence_index": 26,
        "prompt_text": "Passive of: 'She has completed the report.'",
        "options": [
            "The report is completed by her.",
            "The report was completed by her.",
            "The report has been completed by her.",
            "The report had been completed by her."
        ],
        "correct_answer": "The report has been completed by her.", "difficulty": "easy"
    },
    {
        "id": "sec-c-g-27", "section": "C", "item_type": "grammar_mcq", "sequence_index": 27,
        "prompt_text": "Active of: 'The cake was eaten by the children.'",
        "options": [
            "The children eat the cake.",
            "The children ate the cake.",
            "The children have eaten the cake.",
            "The children were eating the cake."
        ],
        "correct_answer": "The children ate the cake.", "difficulty": "easy"
    },

    # Mixed / Prepositions / Subject-Verb Agreement (28-34)
    {
        "id": "sec-c-g-28", "section": "C", "item_type": "grammar_mcq", "sequence_index": 28,
        "prompt_text": "She is interested _____ learning foreign languages.",
        "options": ["on", "at", "in", "with"], "correct_answer": "in", "difficulty": "easy"
    },
    {
        "id": "sec-c-g-29", "section": "C", "item_type": "grammar_mcq", "sequence_index": 29,
        "prompt_text": "Neither the manager nor the employees _____ present at the meeting.",
        "options": ["was", "were", "is", "be"], "correct_answer": "were", "difficulty": "medium"
    },
    {
        "id": "sec-c-g-30", "section": "C", "item_type": "grammar_mcq", "sequence_index": 30,
        "prompt_text": "He congratulated me _____ my success.",
        "options": ["for", "on", "at", "about"], "correct_answer": "on", "difficulty": "medium"
    },
    {
        "id": "sec-c-g-31", "section": "C", "item_type": "grammar_mcq", "sequence_index": 31,
        "prompt_text": "Each of the students _____ given a certificate.",
        "options": ["were", "was", "have been", "are"], "correct_answer": "was", "difficulty": "medium"
    },
    {
        "id": "sec-c-g-32", "section": "C", "item_type": "grammar_mcq", "sequence_index": 32,
        "prompt_text": "Despite _____ hard, he failed the examination.",
        "options": ["study", "of studying", "studying", "he studied"], "correct_answer": "studying", "difficulty": "hard"
    },
    {
        "id": "sec-c-g-33", "section": "C", "item_type": "grammar_mcq", "sequence_index": 33,
        "prompt_text": "The news _____ better than we expected.",
        "options": ["are", "is", "were", "have been"], "correct_answer": "is", "difficulty": "medium"
    },
    {
        "id": "sec-c-g-34", "section": "C", "item_type": "grammar_mcq", "sequence_index": 34,
        "prompt_text": "Hardly had I entered the room _____ the phone rang.",
        "options": ["than", "when", "then", "after"], "correct_answer": "when", "difficulty": "hard"
    },

    # ==================== SECTION D: Listening Comprehension (4 Passages, 16 MCQs) ====================
    # Passage 1
    {
        "id": "sec-d-p1", "section": "D", "item_type": "listening_comprehension", "sequence_index": 1,
        "passage_group_id": "p1",
        "prompt_text": "Passage 1: Global Climate Research\nRecent satellite measurements indicate that polar ice sheets are melting at an accelerated pace. Climate scientists emphasize that reducing greenhouse gas emissions over the next decade is critical to preventing sea level rise.",
        "options": None, "correct_answer": None, "difficulty": "medium"
    },
    {
        "id": "sec-d-p1-q1", "section": "D", "item_type": "listening_comprehension", "sequence_index": 2,
        "passage_group_id": "p1",
        "prompt_text": "What do recent satellite measurements show regarding polar ice sheets?",
        "options": ["They are growing thicker.", "They are melting at an accelerated pace.", "They remain unchanged.", "They are shifting southward."],
        "correct_answer": "They are melting at an accelerated pace.", "difficulty": "medium"
    },
    {
        "id": "sec-d-p1-q2", "section": "D", "item_type": "listening_comprehension", "sequence_index": 3,
        "passage_group_id": "p1",
        "prompt_text": "What action do climate scientists emphasize as critical over the next decade?",
        "options": ["Building coastal walls.", "Reducing greenhouse gas emissions.", "Increasing satellite launches.", "Planting polar forests."],
        "correct_answer": "Reducing greenhouse gas emissions.", "difficulty": "medium"
    },
    {
        "id": "sec-d-p1-q3", "section": "D", "item_type": "listening_comprehension", "sequence_index": 4,
        "passage_group_id": "p1",
        "prompt_text": "What is the primary danger associated with accelerated ice melting?",
        "options": ["Global cooling.", "Sea level rise.", "Volcanic eruptions.", "Reduced solar radiation."],
        "correct_answer": "Sea level rise.", "difficulty": "easy"
    },
    {
        "id": "sec-d-p1-q4", "section": "D", "item_type": "listening_comprehension", "sequence_index": 5,
        "passage_group_id": "p1",
        "prompt_text": "How was the data regarding polar ice sheets collected?",
        "options": ["Through ocean buoys.", "Via satellite measurements.", "By weather balloons.", "Through submarine sonar."],
        "correct_answer": "Via satellite measurements.", "difficulty": "medium"
    },

    # Passage 2
    {
        "id": "sec-d-p2", "section": "D", "item_type": "listening_comprehension", "sequence_index": 6,
        "passage_group_id": "p2",
        "prompt_text": "Passage 2: The Invention of Printing\nJohannes Gutenberg invented the movable type printing press around 1440 in Mainz, Germany. This breakthrough democratized access to knowledge, sparking widespread literacy and the Renaissance across Europe.",
        "options": None, "correct_answer": None, "difficulty": "medium"
    },
    {
        "id": "sec-d-p2-q1", "section": "D", "item_type": "listening_comprehension", "sequence_index": 7,
        "passage_group_id": "p2",
        "prompt_text": "Who invented the movable type printing press?",
        "options": ["Leonardo da Vinci", "Johannes Gutenberg", "Isaac Newton", "Galileo Galilei"],
        "correct_answer": "Johannes Gutenberg", "difficulty": "easy"
    },
    {
        "id": "sec-d-p2-q2", "section": "D", "item_type": "listening_comprehension", "sequence_index": 8,
        "passage_group_id": "p2",
        "prompt_text": "Around which year was the printing press invented?",
        "options": ["1250", "1340", "1440", "1540"],
        "correct_answer": "1440", "difficulty": "easy"
    },
    {
        "id": "sec-d-p2-q3", "section": "D", "item_type": "listening_comprehension", "sequence_index": 9,
        "passage_group_id": "p2",
        "prompt_text": "In which city was the printing press developed?",
        "options": ["Mainz, Germany", "Florence, Italy", "Paris, France", "London, England"],
        "correct_answer": "Mainz, Germany", "difficulty": "medium"
    },
    {
        "id": "sec-d-p2-q4", "section": "D", "item_type": "listening_comprehension", "sequence_index": 10,
        "passage_group_id": "p2",
        "prompt_text": "What major historical movement was catalyzed by the printing press?",
        "options": ["Industrial Revolution", "The Renaissance", "The Enlightenment", "The Bronze Age"],
        "correct_answer": "The Renaissance", "difficulty": "medium"
    },

    # Passage 3
    {
        "id": "sec-d-p3", "section": "D", "item_type": "listening_comprehension", "sequence_index": 11,
        "passage_group_id": "p3",
        "prompt_text": "Passage 3: Deep Sea Biodiversity\nHydrothermal vents on the ocean floor support unique ecosystems thriving without sunlight. Bacteria utilize chemosynthesis using hydrogen sulfide, sustaining tube worms, giant clams, and blind crabs.",
        "options": None, "correct_answer": None, "difficulty": "hard"
    },
    {
        "id": "sec-d-p3-q1", "section": "D", "item_type": "listening_comprehension", "sequence_index": 12,
        "passage_group_id": "p3",
        "prompt_text": "What process do hydrothermal vent bacteria use to produce energy without sunlight?",
        "options": ["Photosynthesis", "Chemosynthesis", "Fermentation", "Respiration"],
        "correct_answer": "Chemosynthesis", "difficulty": "hard"
    },
    {
        "id": "sec-d-p3-q2", "section": "D", "item_type": "listening_comprehension", "sequence_index": 13,
        "passage_group_id": "p3",
        "prompt_text": "Which chemical compound do the bacteria utilize?",
        "options": ["Carbon dioxide", "Sodium chloride", "Hydrogen sulfide", "Methane gas"],
        "correct_answer": "Hydrogen sulfide", "difficulty": "hard"
    },
    {
        "id": "sec-d-p3-q3", "section": "D", "item_type": "listening_comprehension", "sequence_index": 14,
        "passage_group_id": "p3",
        "prompt_text": "Which organism is NOT mentioned as living near hydrothermal vents?",
        "options": ["Tube worms", "Giant clams", "Blind crabs", "Sea turtles"],
        "correct_answer": "Sea turtles", "difficulty": "medium"
    },
    {
        "id": "sec-d-p3-q4", "section": "D", "item_type": "listening_comprehension", "sequence_index": 15,
        "passage_group_id": "p3",
        "prompt_text": "What makes hydrothermal vent ecosystems particularly unique?",
        "options": ["They exist near coral reefs.", "They thrive completely without sunlight.", "They migrate seasonally.", "They are freshwater environments."],
        "correct_answer": "They thrive completely without sunlight.", "difficulty": "medium"
    },

    # Passage 4
    {
        "id": "sec-d-p4", "section": "D", "item_type": "listening_comprehension", "sequence_index": 16,
        "passage_group_id": "p4",
        "prompt_text": "Passage 4: Artificial Intelligence in Medicine\nMedical diagnostic AI models analyze radiological images such as X-rays and MRIs with remarkable precision. Radiologists use these tools as decision-support systems to detect early-stage abnormalities.",
        "options": None, "correct_answer": None, "difficulty": "medium"
    },
    {
        "id": "sec-d-p4-q1", "section": "D", "item_type": "listening_comprehension", "sequence_index": 17,
        "passage_group_id": "p4",
        "prompt_text": "What type of images do medical diagnostic AI models analyze?",
        "options": ["Ultrasonic echoes", "Radiological images like X-rays and MRIs", "Microscopic slide cultures", "Thermal infrared scans"],
        "correct_answer": "Radiological images like X-rays and MRIs", "difficulty": "easy"
    },
    {
        "id": "sec-d-p4-q2", "section": "D", "item_type": "listening_comprehension", "sequence_index": 18,
        "passage_group_id": "p4",
        "prompt_text": "How do radiologists primarily utilize these AI tools?",
        "options": ["As replacement doctors", "As decision-support systems", "For patient billing", "For surgical automation"],
        "correct_answer": "As decision-support systems", "difficulty": "medium"
    },
    {
        "id": "sec-d-p4-q3", "section": "D", "item_type": "listening_comprehension", "sequence_index": 19,
        "passage_group_id": "p4",
        "prompt_text": "What is a primary benefit of AI in medical image analysis?",
        "options": ["Detecting early-stage abnormalities", "Eliminating hospital waiting rooms", "Manufacturing pharmaceuticals", "Performing physical examinations"],
        "correct_answer": "Detecting early-stage abnormalities", "difficulty": "easy"
    },
    {
        "id": "sec-d-p4-q4", "section": "D", "item_type": "listening_comprehension", "sequence_index": 20,
        "passage_group_id": "p4",
        "prompt_text": "Which medical professionals are mentioned as working alongside AI tools?",
        "options": ["Pharmacists", "Surgeons", "Radiologists", "Pediatricians"],
        "correct_answer": "Radiologists", "difficulty": "easy"
    }
]

def seed_full_assessment(db: Session):
    """Populates all 4 section items (A, B, C, D) if unseeded."""
    count = db.query(AssessmentItem).count()
    # Check if section A items exist
    sec_a_count = db.query(AssessmentItem).filter(AssessmentItem.section == "A").count()
    if sec_a_count == 0:
        # Wipe old demo seed items if any to avoid ID collisions
        db.query(AssessmentItem).delete()
        db.commit()

        for item_data in FULL_SEED_ITEMS:
            item = AssessmentItem(**item_data)
            db.add(item)
        db.commit()
