document.addEventListener('DOMContentLoaded', () => {
    // 1. Combine Data
    const fullQuestionBank = [
        window.unit1Data,
        window.unit2Data,
        window.unit3Data,
        window.unit4Data,
        window.unit5Data
    ].filter(Boolean); // Filter out any undefined just in case

    // 2. State Management
    let currentUnit = null; // null means search mode or no unit selected
    let currentFilter = 'all'; // 'all', '2mark', '16mark'
    
    // 3. DOM Elements
    const unitGrid = document.getElementById('unitGrid');
    const questionsContainer = document.getElementById('questionsContainer');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('searchInput');
    const searchResultsHeader = document.getElementById('searchResultsHeader');
    const themeToggle = document.getElementById('themeToggle');
    const printBtn = document.getElementById('printBtn');

    // 4. Render Unit Cards
    function renderUnitCards() {
        unitGrid.innerHTML = '';
        fullQuestionBank.forEach(unitObj => {
            const card = document.createElement('div');
            card.className = 'unit-card';
            card.dataset.unitId = unitObj.unit;
            card.innerHTML = `
                <h3>அலகு ${unitObj.unit}</h3>
                <p>${unitObj.title}</p>
            `;
            card.addEventListener('click', () => {
                // Clear search
                searchInput.value = '';
                searchResultsHeader.classList.add('hidden');
                
                // Update active state
                document.querySelectorAll('.unit-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                
                currentUnit = unitObj.unit;
                renderQuestions();
                
                // Scroll to content
                document.getElementById('contentArea').scrollIntoView({ behavior: 'smooth' });
            });
            unitGrid.appendChild(card);
        });
    }

    // 5. Render Questions
    function renderQuestions(searchQuery = '') {
        questionsContainer.innerHTML = '';
        let questionsToRender = [];

        if (searchQuery) {
            // Search across all units
            const lowerQuery = searchQuery.toLowerCase();
            fullQuestionBank.forEach(unitObj => {
                unitObj.questions.forEach(q => {
                    if (q.question.toLowerCase().includes(lowerQuery) || q.answer.toLowerCase().includes(lowerQuery)) {
                        questionsToRender.push({ ...q, unitName: `அலகு ${unitObj.unit}` });
                    }
                });
            });
        } else if (currentUnit) {
            // Show selected unit
            const unitObj = fullQuestionBank.find(u => u.unit === currentUnit);
            if (unitObj) {
                questionsToRender = unitObj.questions.map(q => ({ ...q, unitName: '' }));
            }
        } else {
            // Nothing selected
            questionsContainer.innerHTML = '<div class="placeholder-msg">தயவுசெய்து ஒரு அலகினை தேர்ந்தெடுக்கவும் அல்லது தேடவும்.</div>';
            return;
        }

        // Apply filter
        if (currentFilter !== 'all') {
            questionsToRender = questionsToRender.filter(q => q.type === currentFilter);
        }

        if (questionsToRender.length === 0) {
            questionsContainer.innerHTML = '<div class="placeholder-msg">எந்த வினாக்களும் கிடைக்கவில்லை.</div>';
            return;
        }

        // Render HTML
        questionsToRender.forEach((q, index) => {
            const item = document.createElement('div');
            item.className = 'question-item';
            
            const badgeText = q.type === '2mark' ? '2 மதிப்பெண்' : '16 மதிப்பெண்';
            const unitBadge = q.unitName ? `<span class="q-badge" style="background:var(--text-secondary)">${q.unitName}</span>` : '';
            
            // Highlight text if searching
            let displayQuestion = q.question;
            if (searchQuery) {
                const regex = new RegExp(`(${searchQuery})`, 'gi');
                displayQuestion = displayQuestion.replace(regex, '<mark>$1</mark>');
            }

            item.innerHTML = `
                <div class="question-header">
                    <div style="display:flex; flex-direction:column; gap:0.5rem">
                        <div style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
                            <span class="q-badge">${badgeText}</span>
                            ${unitBadge}
                        </div>
                        <div class="q-text">${displayQuestion}</div>
                    </div>
                    <i class="fa-solid fa-chevron-down toggle-icon"></i>
                </div>
                <div class="answer-content">
                    ${q.answer}
                </div>
            `;

            // Accordion toggle
            const header = item.querySelector('.question-header');
            header.addEventListener('click', () => {
                const isOpen = item.classList.contains('open');
                // Close all others
                document.querySelectorAll('.question-item').forEach(qi => qi.classList.remove('open'));
                if (!isOpen) {
                    item.classList.add('open');
                }
            });

            questionsContainer.appendChild(item);
        });
    }

    // 6. Event Listeners
    
    // Filters
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderQuestions(searchInput.value);
        });
    });

    // Search
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query.length > 0) {
            document.querySelectorAll('.unit-card').forEach(c => c.classList.remove('active'));
            currentUnit = null;
            searchResultsHeader.classList.remove('hidden');
            renderQuestions(query);
        } else {
            searchResultsHeader.classList.add('hidden');
            if (currentUnit) {
                document.querySelector(`[data-unit-id="${currentUnit}"]`)?.classList.add('active');
            }
            renderQuestions();
        }
    });

    // Dark Mode Toggle
    themeToggle.addEventListener('click', () => {
        const root = document.documentElement;
        const currentTheme = root.getAttribute('data-theme');
        const icon = themeToggle.querySelector('i');
        
        if (currentTheme === 'dark') {
            root.removeAttribute('data-theme');
            icon.className = 'fa-solid fa-moon';
        } else {
            root.setAttribute('data-theme', 'dark');
            icon.className = 'fa-solid fa-sun';
        }
    });

    // Print
    printBtn.addEventListener('click', () => {
        // Open all accordions before printing
        document.querySelectorAll('.question-item').forEach(qi => qi.classList.add('open'));
        window.print();
    });

    // Initialize
    renderUnitCards();
    
    // Automatically select unit 1 to start
    if (unitGrid.firstChild) {
        unitGrid.firstChild.click();
    }
});
