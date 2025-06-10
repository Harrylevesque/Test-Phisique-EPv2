// Remove all creation logic from this file. Only keep the grading system usage logic (upload, user selection, grading calculation).
// --- Grading System Usage Page Logic ---
let uploadedActivities = [];
let userGender = '';
let userAge = '';

const uploadInput = document.getElementById('upload-json');
const userForm = document.getElementById('user-form');
const userGenderSelect = document.getElementById('user-gender');
const userAgeSelect = document.getElementById('user-age');
const userGradeSelect = document.getElementById('user-grade');
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
            userGenderSelect.innerHTML = '<option value="">Sélectionner le sexe</option>' + Array.from(genders).map(g => `<option value="${g}">${g === 'Boy' ? 'Garçon' : 'Fille'}</option>`).join('');
            // On ne remplit pas userAgeSelect ici, il sera rempli selon le grade
            userAgeSelect.innerHTML = '<option value="">Sélectionner l\'âge</option>';
            userForm.style.display = '';
            gradingSection.innerHTML = '';
        } catch (err) {
            alert('Fichier JSON invalide.');
        }
    };
    reader.readAsText(file);
};

// Met à jour la liste des âges selon le grade sélectionné
userGradeSelect.onchange = function() {
    const grade = userGradeSelect.value;
    let ages = [];
    if (grade === '1') ages = [12, 13];
    else if (grade === '2') ages = [13, 14];
    else if (grade === '3') ages = [14, 15];
    else if (grade === '4') ages = [15, 16];
    else if (grade === '5') ages = [16, 17];
    userAgeSelect.innerHTML = '<option value="">Sélectionner l\'âge</option>' + ages.map(a => `<option value="${a}">${a}</option>`).join('');
};

startBtn.onclick = function(e) {
    e.preventDefault();
    const grade = userGradeSelect.value;
    userGender = userGenderSelect.value === 'Garçon' ? 'Boy' : (userGenderSelect.value === 'Fille' ? 'Girl' : userGenderSelect.value);
    userAge = parseInt(userAgeSelect.value, 10);
    if (!grade || !userGender || isNaN(userAge)) {
        alert('Veuillez sélectionner le niveau, le sexe et l\'âge.');
        return;
    }
    showGradingInputs();
};

function showGradingInputs() {
    let html = '';
    let totalPoints = 0;
    let totalPossible = 0;
    let foundAny = false;
    html += '<form id="grading-form">';
    uploadedActivities.forEach((act, aidx) => {
        // Find the matching criteria for this user
        const crit = act.criteria.find(c => c.gender === userGender && c.age === userAge);
        if (!crit) return;
        foundAny = true;
        html += `<div class="activity"><strong>${act.name}</strong> <span style="color:#888;font-size:0.95em;">[${crit.criteria}]</span><br>Max : ${crit.maxScore}<br>`;
        html += `<input type="text" name="grade-${aidx}" min="0" max="${crit.maxScore}" placeholder="Entrez votre score" required style="width:120px;">`;
        html += `<span id="block-result-${aidx}" style="margin-left:10px;color:#007bff;"></span>`;
        html += '</div>';
        totalPossible += crit.scale.reduce((acc, b) => acc + b.points, 0);
    });
    html += foundAny ? '<button type="submit">Calculer</button></form>' : '';
    html += foundAny ? '<div id="grading-result" style="margin-top:20px;font-size:1.2em;"></div>' : '<div style="color:red;margin-top:20px;">Aucune activité ne correspond à vos critères.</div>';
    gradingSection.innerHTML = html;
    if (foundAny) {
        document.getElementById('grading-form').onsubmit = function(e) {
            e.preventDefault();
            let total = 0;
            let totalBlocks = 0;
            uploadedActivities.forEach((act, aidx) => {
                const crit = act.criteria.find(c => c.gender === userGender && c.age === userAge);
                if (!crit) return;
                const val = parseFloat(e.target[`grade-${aidx}`].value.replace(',', '.'));
                let foundBlock = null;
                if (!isNaN(val)) {
                    foundBlock = crit.scale.find(b => val >= b.min && val <= b.max);
                    if (foundBlock) {
                        total += foundBlock.points;
                        document.getElementById(`block-result-${aidx}`).textContent = `Bloc : ${foundBlock.min}-${foundBlock.max} → ${foundBlock.points} pts`;
                    } else {
                        document.getElementById(`block-result-${aidx}`).textContent = 'Aucun bloc';
                    }
                }
                totalBlocks += crit.scale.reduce((acc, b) => acc + b.points, 0);
            });
            let percent = totalBlocks ? ((total / totalBlocks) * 100).toFixed(2) : '0.00';
            document.getElementById('grading-result').innerHTML = `<strong>Total : ${total} / ${totalBlocks} pts (${percent}%)</strong>`;
        };
    }
}

// --- Chargement automatique du fichier JSON au démarrage ---
fetch('scr/fullversion.json')
    .then(r => r.json())
    .then(data => {
        uploadedActivities = data;
        // Remplir les options de sexe et d'âge comme lors d'un upload
        const genders = new Set();
        uploadedActivities.forEach(act => {
            act.criteria.forEach(c => {
                genders.add(c.gender);
            });
        });
        userGenderSelect.innerHTML = '<option value="">Sélectionner le sexe</option>' + Array.from(genders).map(g => `<option value="${g}">${g === 'Boy' ? 'Garçon' : 'Fille'}</option>`).join('');
        userAgeSelect.innerHTML = '<option value="">Sélectionner l\'âge</option>';
        userForm.style.display = '';
        gradingSection.innerHTML = '';
    })
    .catch(() => {
        // Optionnel : message d'erreur si le fichier n'est pas trouvé
    });
