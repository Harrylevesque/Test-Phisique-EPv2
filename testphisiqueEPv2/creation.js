// Data structure to hold activities
let activities = [];

// Helper to render all activities
function renderActivities() {
    const list = document.getElementById('activities-list');
    list.innerHTML = '';
    activities.forEach((activity, idx) => {
        const div = document.createElement('div');
        div.className = 'activity';
        div.innerHTML = `
            <div class="activity-header">
                <strong>${activity.name}</strong>
                <button class="remove-btn" onclick="removeActivity(${idx})">Supprimer</button>
            </div>
            <button onclick="toggleCriteriaForm(${idx})" style="margin:10px 0;">${activity.showCriteriaForm ? 'Cacher' : 'Ajouter/Modifier Critères'}</button>
            <div id="criteria-form-${idx}" style="display:${activity.showCriteriaForm ? 'block' : 'none'};margin-bottom:10px;">
                <form onsubmit="addCriteria(event,${idx})" style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
                    <select name="gender" required>
                        <option value="">Sexe</option>
                        <option value="Boy">Garçon</option>
                        <option value="Girl">Fille</option>
                    </select>
                    <input type="text" name="age" min="1" max="120" placeholder="Âge" required style="width:70px;">
                    <input type="text" name="criteria" placeholder="Critère (ex: Pushups)" required style="width:120px;">
                    <button type="submit">Ajouter Critère</button>
                </form>
            </div>
            <div class="event-list">
                ${activity.criteria.map((crit, cidx) => `
                    <div class="event">
                        <strong>${crit.criteria} (${crit.gender === 'Boy' ? 'Garçon' : 'Fille'}, Âge ${crit.age})</strong> <span style="color:#888;font-size:0.95em;">[Max: ${crit.maxScore}]</span>
                        <button class="remove-btn" onclick="removeCriteria(${idx},${cidx})">Supprimer</button>
                        <button onclick="toggleScaleForm(${idx},${cidx})" style="margin-left:8px;">${crit.showScaleForm ? 'Cacher' : 'Ajouter/Modifier Blocs'}</button>
                        <div id="scale-form-${idx}-${cidx}" style="display:${crit.showScaleForm ? 'block' : 'none'};margin-top:6px;">
                            <form onsubmit="addScaleBlock(event,${idx},${cidx})" style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
                                <input type="text" name="min" placeholder="Score min" required style="width:70px;">
                                <input type="text" name="max" placeholder="Score max" required style="width:70px;">
                                <input type="text" name="points" placeholder="Points pour ce bloc" required style="width:110px;">
                                <button type="submit">Ajouter Bloc</button>
                            </form>
                        </div>
                        <div class="block-list">
                            ${crit.scale.map((block, bidx) => `
                                <div class="block">
                                    Score ${block.min} - ${block.max} → ${block.points} pts
                                    <button class="remove-btn" onclick="removeScaleBlock(${idx},${cidx},${bidx})">Supprimer</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        list.appendChild(div);
    });
}

// Add activity
const activityForm = document.getElementById('activity-form');
activityForm.onsubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('activity-name').value.trim();
    if (name) {
        activities.push({ name, criteria: [], showCriteriaForm: false });
        activityForm.reset();
        renderActivities();
    }
};

// Remove activity
function removeActivity(idx) {
    activities.splice(idx, 1);
    renderActivities();
}

// Toggle criteria form visibility
function toggleCriteriaForm(idx) {
    activities[idx].showCriteriaForm = !activities[idx].showCriteriaForm;
    renderActivities();
}

// Add criteria (gender/age/criteria name)
function addCriteria(e, aidx) {
    e.preventDefault();
    const gender = e.target.gender.value;
    const age = parseFloat(e.target.age.value.replace(',', '.'));
    const criteria = e.target.criteria.value.trim();
    let maxScore = prompt('Enter the maximum score for this criteria:', '100');
    if (maxScore) maxScore = parseFloat(maxScore.replace(',', '.'));
    if (gender && !isNaN(age) && criteria && !isNaN(maxScore)) {
        activities[aidx].criteria.push({ gender, age, criteria, maxScore, scale: [], showScaleForm: false });
        renderActivities();
    }
}

// Remove criteria
function removeCriteria(aidx, cidx) {
    activities[aidx].criteria.splice(cidx, 1);
    renderActivities();
}

// Toggle scale form visibility
function toggleScaleForm(aidx, cidx) {
    activities[aidx].criteria[cidx].showScaleForm = !activities[aidx].criteria[cidx].showScaleForm;
    renderActivities();
}

// Add grading scale block
function addScaleBlock(e, aidx, cidx) {
    e.preventDefault();
    const min = parseFloat(e.target.min.value.replace(',', '.'));
    const max = parseFloat(e.target.max.value.replace(',', '.'));
    const points = parseFloat(e.target.points.value.replace(',', '.'));
    if (!isNaN(min) && !isNaN(max) && !isNaN(points)) {
        activities[aidx].criteria[cidx].scale.push({ min, max, points });
        renderActivities();
    }
}

// Remove grading scale block
function removeScaleBlock(aidx, cidx, bidx) {
    activities[aidx].criteria[cidx].scale.splice(bidx, 1);
    renderActivities();
}

// Download data as JSON file
const downloadBtn = document.getElementById('download-btn');
downloadBtn.onclick = function() {
    const dataStr = JSON.stringify(activities, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grading-system-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Handle upload for editing
const uploadInput = document.getElementById('upload-json');
uploadInput.onchange = function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            activities = JSON.parse(evt.target.result);
            renderActivities();
        } catch (err) {
            alert('Fichier JSON invalide.');
        }
    };
    reader.readAsText(file);
};
//test
// Initial render
renderActivities();
