// Remove all creation logic from this file. Only keep the grading system usage logic (upload, user selection, grading calculation).
// --- Grading System Usage Page Logic ---
let uploadedActivities = [];
let userGender = '';
let userAge = '';

const uploadInput = document.getElementById('upload-json');
const userForm = document.getElementById('user-form');
const userGenderSelect = document.getElementById('user-gender');
const userAgeSelect = document.getElementById('user-age');
const startBtn = document.getElementById('start-btn');
const gradingSection = document.getElementById('grading-section');

uploadInput.onchange = function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            uploadedActivities = JSON.parse(evt.target.result);
            // Populate gender and age options based on uploaded data
            const genders = new Set();
            const ages = new Set();
            uploadedActivities.forEach(act => {
                act.criteria.forEach(c => {
                    genders.add(c.gender);
                    ages.add(c.age);
                });
            });
            userGenderSelect.innerHTML = '<option value="">Select Gender</option>' + Array.from(genders).map(g => `<option value="${g}">${g}</option>`).join('');
            userAgeSelect.innerHTML = '<option value="">Select Age</option>' + Array.from(ages).sort((a,b)=>a-b).map(a => `<option value="${a}">${a}</option>`).join('');
            userForm.style.display = '';
            gradingSection.innerHTML = '';
        } catch (err) {
            alert('Invalid JSON file.');
        }
    };
    reader.readAsText(file);
};

startBtn.onclick = function(e) {
    e.preventDefault();
    userGender = userGenderSelect.value;
    userAge = parseInt(userAgeSelect.value, 10);
    if (!userGender || isNaN(userAge)) {
        alert('Please select gender and age.');
        return;
    }
    showGradingInputs();
};

function showGradingInputs() {
    let html = '';
    let totalPoints = 0;
    let totalPossible = 0;
    html += '<form id="grading-form">';
    uploadedActivities.forEach((act, aidx) => {
        // Find the matching criteria for this user
        const crit = act.criteria.find(c => c.gender === userGender && c.age === userAge);
        if (!crit) return;
        html += `<div class="activity"><strong>${act.name}</strong> <span style="color:#888;font-size:0.95em;">[${crit.criteria}]</span><br>Max: ${crit.maxScore}<br>`;
        html += `<input type="number" name="grade-${aidx}" min="0" max="${crit.maxScore}" placeholder="Enter your score" required style="width:120px;">`;
        html += `<span id="block-result-${aidx}" style="margin-left:10px;color:#007bff;"></span>`;
        html += '</div>';
        totalPossible += crit.scale.reduce((acc, b) => acc + b.points, 0);
    });
    html += '<button type="submit">Calculate</button></form>';
    gradingSection.innerHTML = html;
    document.getElementById('grading-form').onsubmit = function(e) {
        e.preventDefault();
        let total = 0;
        let totalBlocks = 0;
        uploadedActivities.forEach((act, aidx) => {
            const crit = act.criteria.find(c => c.gender === userGender && c.age === userAge);
            if (!crit) return;
            const val = parseFloat(e.target[`grade-${aidx}`].value);
            let foundBlock = null;
            if (!isNaN(val)) {
                foundBlock = crit.scale.find(b => val >= b.min && val <= b.max);
                if (foundBlock) {
                    total += foundBlock.points;
                    document.getElementById(`block-result-${aidx}`).textContent = `Block: ${foundBlock.min}-${foundBlock.max} → ${foundBlock.points} pts`;
                } else {
                    document.getElementById(`block-result-${aidx}`).textContent = 'No block';
                }
            }
            totalBlocks += crit.scale.reduce((acc, b) => acc + b.points, 0);
        });
        let percent = totalBlocks ? ((total / totalBlocks) * 100).toFixed(2) : '0.00';
        gradingSection.innerHTML += `<div style="margin-top:20px;font-size:1.2em;"><strong>Total: ${total} / ${totalBlocks} pts (${percent}%)</strong></div>`;
    };
}
