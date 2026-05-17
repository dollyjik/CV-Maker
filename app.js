let currentCV = null;
let currentTheme = 'classic';
let currentCVId = null;
let photoDataUrl = null;
let isDarkMode = false;

const STORAGE_KEY = 'cvmaker_cvs';
const DARK_MODE_KEY = 'cvmaker_dark_mode';

function initDarkMode() {
  isDarkMode = localStorage.getItem(DARK_MODE_KEY) === 'true';
  applyDarkMode();
}

function toggleDarkMode() {
  isDarkMode = !isDarkMode;
  localStorage.setItem(DARK_MODE_KEY, isDarkMode);
  applyDarkMode();
}

function applyDarkMode() {
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
    document.getElementById('darkModeIcon').className = 'fas fa-sun';
    document.getElementById('darkModeToggle').title = 'Aydınlık Moda Geç';
  } else {
    document.body.classList.remove('dark-mode');
    document.getElementById('darkModeIcon').className = 'fas fa-moon';
    document.getElementById('darkModeToggle').title = 'Karanlık Moda Geç';
  }
}

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  if (name === 'my-cvs') renderCVList();
}

function startNewCV() {
  currentCVId = null;
  currentTheme = 'classic';
  photoDataUrl = null;
  resetForm();
  applyTheme('classic');
  showPage('editor');
  updatePreview();
}

function selectTheme(theme) {
  currentTheme = theme;
  applyTheme(theme);
  document.querySelectorAll('.theme-dot').forEach(d => d.classList.remove('active'));
  document.querySelector('.theme-' + theme + '-dot').classList.add('active');
  updatePreview();
}

function applyTheme(theme) {
  document.body.className = 'theme-' + theme + (isDarkMode ? ' dark-mode' : '');
}

function showSection(name, btn) {
  document.querySelectorAll('.form-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sec-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('section-' + name).classList.add('active');
  if (btn) btn.classList.add('active');
}

function handlePhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    photoDataUrl = ev.target.result;
    const prev = document.getElementById('photoPreview');
    prev.innerHTML = '<img src="' + photoDataUrl + '" alt="photo" />';
    updatePreview();
  };
  reader.readAsDataURL(file);
}

const itemCounts = {};

function addItem(type) {
  if (!itemCounts[type]) itemCounts[type] = 0;
  const id = type + '_' + (++itemCounts[type]);
  const container = document.getElementById(type + 'List');
  const el = document.createElement('div');
  el.className = 'dynamic-item';
  el.id = id;
  el.innerHTML = buildItemHTML(type, id);
  container.appendChild(el);
}

function buildItemHTML(type, id) {
  const header = `<div class="dynamic-item-header"><h4>${typeLabel(type)}</h4><button class="btn-remove" onclick="removeItem('${id}')"><i class="fas fa-trash"></i></button></div>`;
  const grid = (inner) => `<div class="form-grid">${inner}</div>`;

  if (type === 'experience') return header + grid(`
    <div class="form-group"><label>İş Unvanı</label><input type="text" id="${id}_title" placeholder="Yazılım Geliştirici" oninput="updatePreview()" /></div>
    <div class="form-group"><label>Şirket</label><input type="text" id="${id}_company" placeholder="ABC Şirketi" oninput="updatePreview()" /></div>
    <div class="form-group"><label>Başlangıç</label><input type="month" id="${id}_start" oninput="updatePreview()" /></div>
    <div class="form-group"><label>Bitiş <small>(Boş=Devam ediyor)</small></label><input type="month" id="${id}_end" oninput="updatePreview()" /></div>
    <div class="form-group"><label>Şehir / Ülke</label><input type="text" id="${id}_location" placeholder="İstanbul, TR" oninput="updatePreview()" /></div>
    <div class="form-group"><label>Çalışma Tipi</label><select id="${id}_emptype" onchange="updatePreview()"><option>Tam Zamanlı</option><option>Yarı Zamanlı</option><option>Staj</option><option>Serbest</option><option>Uzaktan</option></select></div>
    <div class="form-group full"><label>Görev Tanımı & Başarılar</label><textarea id="${id}_desc" rows="4" placeholder="• Görev ve başarılarınızı bullet point ile yazın..." oninput="updatePreview()"></textarea></div>
  `);

  if (type === 'education') return header + grid(`
    <div class="form-group full"><label>Okul / Üniversite</label><input type="text" id="${id}_school" placeholder="İstanbul Üniversitesi" oninput="updatePreview()" /></div>
    <div class="form-group"><label>Bölüm / Program</label><input type="text" id="${id}_field" placeholder="Bilgisayar Mühendisliği" oninput="updatePreview()" /></div>
    <div class="form-group"><label>Derece</label><select id="${id}_degree" onchange="updatePreview()"><option>Lisans</option><option>Yüksek Lisans</option><option>Doktora</option><option>Ön Lisans</option><option>Lise</option><option>Sertifika</option></select></div>
    <div class="form-group"><label>Başlangıç</label><input type="month" id="${id}_start" oninput="updatePreview()" /></div>
    <div class="form-group"><label>Bitiş</label><input type="month" id="${id}_end" oninput="updatePreview()" /></div>
    <div class="form-group"><label>Not Ortalaması (GPA)</label><input type="text" id="${id}_gpa" placeholder="3.50 / 4.00" oninput="updatePreview()" /></div>
    <div class="form-group full"><label>Aktiviteler / Notlar</label><textarea id="${id}_desc" rows="2" placeholder="Kulüpler, tezler, başarılar..." oninput="updatePreview()"></textarea></div>
  `);

  if (type === 'language') return header + grid(`
    <div class="form-group"><label>Dil</label><input type="text" id="${id}_name" placeholder="İngilizce" oninput="updatePreview()" /></div>
    <div class="form-group"><label>Seviye</label><select id="${id}_level" onchange="updatePreview()">
      <option value="1">A1 – Başlangıç</option>
      <option value="2">A2 – Temel</option>
      <option value="3">B1 – Orta</option>
      <option value="4">B2 – Orta Üstü</option>
      <option value="5">C1 – İleri</option>
      <option value="6">C2 – Anadil Düzeyi</option>
    </select></div>
  `);

  if (type === 'certification') return header + grid(`
    <div class="form-group full"><label>Sertifika Adı</label><input type="text" id="${id}_name" placeholder="AWS Certified Developer" oninput="updatePreview()" /></div>
    <div class="form-group"><label>Veren Kurum</label><input type="text" id="${id}_issuer" placeholder="Amazon Web Services" oninput="updatePreview()" /></div>
    <div class="form-group"><label>Tarih</label><input type="month" id="${id}_date" oninput="updatePreview()" /></div>
    <div class="form-group"><label>Geçerlilik / Süre</label><input type="text" id="${id}_validity" placeholder="3 yıl / Süresiz" oninput="updatePreview()" /></div>
    <div class="form-group full"><label>Sertifika URL</label><input type="url" id="${id}_url" placeholder="https://..." oninput="updatePreview()" /></div>
  `);

  if (type === 'project') return header + grid(`
    <div class="form-group full"><label>Proje Adı</label><input type="text" id="${id}_name" placeholder="E-Ticaret Platformu" oninput="updatePreview()" /></div>
    <div class="form-group"><label>Rol</label><input type="text" id="${id}_role" placeholder="Full Stack Developer" oninput="updatePreview()" /></div>
    <div class="form-group"><label>Tarih</label><input type="month" id="${id}_date" oninput="updatePreview()" /></div>
    <div class="form-group full"><label>Kullanılan Teknolojiler</label><input type="text" id="${id}_tech" placeholder="React, Node.js, PostgreSQL" oninput="updatePreview()" /></div>
    <div class="form-group full"><label>Proje Açıklaması</label><textarea id="${id}_desc" rows="3" placeholder="Projeyi ve katkılarınızı açıklayın..." oninput="updatePreview()"></textarea></div>
    <div class="form-group full"><label>Proje Linki</label><input type="url" id="${id}_url" placeholder="https://..." oninput="updatePreview()" /></div>
  `);

  if (type === 'volunteer') return header + grid(`
    <div class="form-group"><label>Organizasyon</label><input type="text" id="${id}_org" placeholder="Kızılay" oninput="updatePreview()" /></div>
    <div class="form-group"><label>Rol</label><input type="text" id="${id}_role" placeholder="Koordinatör" oninput="updatePreview()" /></div>
    <div class="form-group"><label>Başlangıç</label><input type="month" id="${id}_start" oninput="updatePreview()" /></div>
    <div class="form-group"><label>Bitiş</label><input type="month" id="${id}_end" oninput="updatePreview()" /></div>
    <div class="form-group full"><label>Açıklama</label><textarea id="${id}_desc" rows="2" oninput="updatePreview()"></textarea></div>
  `);

  if (type === 'award') return header + grid(`
    <div class="form-group full"><label>Ödül Adı</label><input type="text" id="${id}_name" placeholder="Yılın Yazılımcısı" oninput="updatePreview()" /></div>
    <div class="form-group"><label>Veren Kurum</label><input type="text" id="${id}_issuer" placeholder="TechFest 2024" oninput="updatePreview()" /></div>
    <div class="form-group"><label>Tarih</label><input type="month" id="${id}_date" oninput="updatePreview()" /></div>
    <div class="form-group full"><label>Açıklama</label><textarea id="${id}_desc" rows="2" oninput="updatePreview()"></textarea></div>
  `);

  if (type === 'publication') return header + grid(`
    <div class="form-group full"><label>Başlık</label><input type="text" id="${id}_title" placeholder="Makale / Kitap başlığı" oninput="updatePreview()" /></div>
    <div class="form-group"><label>Yayınevi / Dergi</label><input type="text" id="${id}_publisher" placeholder="IEEE, Springer..." oninput="updatePreview()" /></div>
    <div class="form-group"><label>Tarih</label><input type="month" id="${id}_date" oninput="updatePreview()" /></div>
    <div class="form-group full"><label>DOI / URL</label><input type="url" id="${id}_url" placeholder="https://..." oninput="updatePreview()" /></div>
  `);

  if (type === 'reference') return header + grid(`
    <div class="form-group"><label>Ad Soyad</label><input type="text" id="${id}_name" placeholder="Ahmet Yılmaz" oninput="updatePreview()" /></div>
    <div class="form-group"><label>Unvan</label><input type="text" id="${id}_title" placeholder="Proje Müdürü" oninput="updatePreview()" /></div>
    <div class="form-group"><label>Şirket</label><input type="text" id="${id}_company" placeholder="ABC Ltd." oninput="updatePreview()" /></div>
    <div class="form-group"><label>E-posta</label><input type="email" id="${id}_email" oninput="updatePreview()" /></div>
    <div class="form-group"><label>Telefon</label><input type="tel" id="${id}_phone" oninput="updatePreview()" /></div>
    <div class="form-group"><label>İlişki</label><input type="text" id="${id}_relation" placeholder="Eski Yöneticim" oninput="updatePreview()" /></div>
  `);

  return header;
}

function typeLabel(type) {
  const labels = { experience:'İş Deneyimi', education:'Eğitim', language:'Dil', certification:'Sertifika', project:'Proje', volunteer:'Gönüllülük', award:'Ödül', publication:'Yayın', reference:'Referans' };
  return labels[type] || type;
}

function removeItem(id) {
  const el = document.getElementById(id);
  if (el) { el.remove(); updatePreview(); }
}

const skillCounts = { technical: 0, software: 0, soft: 0 };

function addSkill(cat) {
  const id = cat + '_skill_' + (++skillCounts[cat]);
  const container = document.getElementById(cat + 'SkillList');
  const div = document.createElement('div');
  div.className = 'skill-item';
  div.id = id;
  div.innerHTML = `
    <input type="text" id="${id}_name" placeholder="Beceri adı" oninput="updatePreview()" />
    <select class="skill-level" id="${id}_level" onchange="updatePreview()">
      <option value="20">Başlangıç</option>
      <option value="40">Temel</option>
      <option value="60" selected>Orta</option>
      <option value="80">İleri</option>
      <option value="100">Uzman</option>
    </select>
    <button class="btn-remove" onclick="removeItem('${id}')"><i class="fas fa-times"></i></button>
  `;
  container.appendChild(div);
}

let hobbies = [];

function addHobby() {
  const input = document.getElementById('hobbyInput');
  const val = input.value.trim();
  if (!val) return;
  hobbies.push(val);
  input.value = '';
  renderHobbies();
  updatePreview();
}

function addHobbyText(text) {
  if (hobbies.includes(text)) return;
  hobbies.push(text);
  renderHobbies();
  updatePreview();
}

function renderHobbies() {
  const list = document.getElementById('hobbyList');
  list.innerHTML = hobbies.map((h, i) => `
    <div class="hobby-tag">${h}<button onclick="removeHobby(${i})">×</button></div>
  `).join('');
}

function removeHobby(i) {
  hobbies.splice(i, 1);
  renderHobbies();
  updatePreview();
}

function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function collectData() {
  const data = {
    theme: currentTheme,
    title: val('cvTitle'),
    photo: photoDataUrl,
    showPhoto: document.getElementById('showPhoto')?.checked ?? true,
    personal: {
      firstName: val('firstName'), lastName: val('lastName'),
      jobTitle: val('jobTitle'), email: val('email'), phone: val('phone'),
      city: val('city'), country: val('country'), birthDate: val('birthDate'),
      maritalStatus: val('maritalStatus'), drivingLicense: val('drivingLicense'),
      linkedin: val('linkedin'), website: val('website'), github: val('github'),
      address: val('address'), nationality: val('nationality'), gender: val('gender')
    },
    summary: { text: val('summary'), objective: val('objective') },
    experience: collectList('experience', ['title','company','start','end','location','emptype','desc']),
    education: collectList('education', ['school','field','degree','start','end','gpa','desc']),
    skills: {
      technical: collectSkills('technical'),
      software: collectSkills('software'),
      soft: collectSkills('soft')
    },
    languages: collectList('language', ['name','level']),
    certifications: collectList('certification', ['name','issuer','date','validity','url']),
    projects: collectList('project', ['name','role','date','tech','desc','url']),
    volunteer: collectList('volunteer', ['org','role','start','end','desc']),
    awards: collectList('award', ['name','issuer','date','desc']),
    publications: collectList('publication', ['title','publisher','date','url']),
    references: { display: val('referenceDisplay'), items: collectList('reference', ['name','title','company','email','phone','relation']) },
    hobbies: [...hobbies]
  };
  return data;
}

function collectList(type, fields) {
  const items = [];
  document.querySelectorAll('[id^="' + type + '_"]').forEach(el => {
    if (!el.classList.contains('dynamic-item')) return;
    const id = el.id;
    const item = {};
    fields.forEach(f => { item[f] = val(id + '_' + f); });
    items.push(item);
  });
  return items;
}

function collectSkills(cat) {
  const skills = [];
  document.querySelectorAll('[id^="' + cat + '_skill_"]').forEach(el => {
    if (!el.classList.contains('skill-item')) return;
    const id = el.id;
    const name = val(id + '_name');
    const level = val(id + '_level');
    if (name) skills.push({ name, level });
  });
  return skills;
}

function updatePreview() {
  const data = collectData();
  const sumEl = document.getElementById('summary');
  if (sumEl) document.getElementById('summaryCount').textContent = sumEl.value.length;
  const preview = document.getElementById('cvPreview');
  preview.innerHTML = buildCVHTML(data);
}

function buildCVHTML(d) {
  const p = d.personal;
  const fullName = [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Adınız Soyadınız';

  const showPhotoEl = document.getElementById('showPhoto');
  const showPhoto = showPhotoEl ? showPhotoEl.checked : true;
  const photoHTML = (d.photo && showPhoto)
    ? `<img class="cv-photo" src="${d.photo}" alt="photo" />`
    : '';

  const contacts = [];
  if (p.email) contacts.push(`<span><i class="fas fa-envelope"></i>${p.email}</span>`);
  if (p.phone) contacts.push(`<span><i class="fas fa-phone"></i>${p.phone}</span>`);
  if (p.city || p.country) contacts.push(`<span><i class="fas fa-map-marker-alt"></i>${[p.city,p.country].filter(Boolean).join(', ')}</span>`);
  if (p.linkedin) contacts.push(`<span><i class="fab fa-linkedin"></i>${p.linkedin}</span>`);
  if (p.website) contacts.push(`<span><i class="fas fa-globe"></i>${p.website}</span>`);
  if (p.github) contacts.push(`<span><i class="fab fa-github"></i>${p.github}</span>`);

  const sideInfo = [];
  if (p.email) sideInfo.push({ icon:'fa-envelope', text: p.email });
  if (p.phone) sideInfo.push({ icon:'fa-phone', text: p.phone });
  if (p.city || p.country) sideInfo.push({ icon:'fa-map-marker-alt', text: [p.city,p.country].filter(Boolean).join(', ') });
  if (p.birthDate) sideInfo.push({ icon:'fa-calendar', text: formatDate(p.birthDate) });
  if (p.nationality) sideInfo.push({ icon:'fa-flag', text: p.nationality });
  if (p.maritalStatus) sideInfo.push({ icon:'fa-heart', text: p.maritalStatus });
  if (p.drivingLicense) sideInfo.push({ icon:'fa-car', text: 'Ehliyet: ' + p.drivingLicense });
  if (p.linkedin) sideInfo.push({ icon:'fa-linkedin fab', text: p.linkedin });
  if (p.website) sideInfo.push({ icon:'fa-globe', text: p.website });
  if (p.github) sideInfo.push({ icon:'fa-github fab', text: p.github });

  const sideInfoHTML = sideInfo.map(i => `<div class="cv-info-item"><i class="fas ${i.icon}"></i><span>${i.text}</span></div>`).join('');

  const theme = d.theme || 'classic';

  if (theme === 'minimal') return buildMinimalCV(d, fullName, photoHTML, contacts, sideInfo);
  if (theme === 'modern') return buildModernCV(d, fullName, photoHTML, contacts, sideInfoHTML);
  if (theme === 'europass') return buildEuropassCV(d, fullName, photoHTML);

  return buildTwoColCV(d, fullName, photoHTML, contacts, sideInfoHTML, theme);
}

function buildTwoColCV(d, fullName, photoHTML, contacts, sideInfoHTML, theme) {
  const p = d.personal;
  const header = `
    <div class="cv-header">
      ${photoHTML}
      <div>
        <div class="cv-name">${fullName}</div>
        ${p.jobTitle ? `<div class="cv-job-title">${p.jobTitle}</div>` : ''}
        ${contacts.length ? `<div class="cv-contact-info">${contacts.join('')}</div>` : ''}
      </div>
    </div>`;

  const sidebar = `
    <div class="cv-sidebar">
      ${sideInfoHTML ? `<div class="cv-section"><div class="cv-section-title">İletişim</div>${sideInfoHTML}</div>` : ''}
      ${buildSkillsSidebar(d.skills)}
      ${buildLanguagesSidebar(d.languages)}
      ${d.hobbies.length ? `<div class="cv-section"><div class="cv-section-title">Hobiler</div><div class="cv-hobby-tags">${d.hobbies.map(h=>`<span class="cv-hobby-tag">${h}</span>`).join('')}</div></div>` : ''}
    </div>`;

  const main = `
    <div class="cv-main">
      ${buildSummarySection(d.summary)}
      ${buildExperienceSection(d.experience)}
      ${buildEducationSection(d.education)}
      ${buildCertSection(d.certifications)}
      ${buildProjectSection(d.projects)}
      ${buildVolunteerSection(d.volunteer)}
      ${buildAwardSection(d.awards)}
      ${buildPublicationSection(d.publications)}
      ${buildReferenceSection(d.references)}
    </div>`;

  return `${header}<div class="cv-body">${sidebar}${main}</div>`;
}

function buildModernCV(d, fullName, photoHTML, contacts, sideInfoHTML) {
  const p = d.personal;
  const header = `
    <div class="cv-header">
      <div style="display:flex;align-items:center;gap:20px">
        ${photoHTML}
        <div>
          <div class="cv-name">${fullName}</div>
          ${p.jobTitle ? `<div class="cv-job-title">${p.jobTitle}</div>` : ''}
        </div>
      </div>
      ${contacts.length ? `<div class="cv-contact-info" style="margin-top:14px">${contacts.join('')}</div>` : ''}
    </div>`;

  const body = `
    <div class="cv-body">
      <div class="cv-sidebar">
        ${sideInfoHTML}
        ${buildSkillsSidebar(d.skills)}
        ${buildLanguagesSidebar(d.languages)}
        ${d.hobbies.length ? `<div class="cv-section"><div class="cv-section-title">Hobiler</div><div class="cv-hobby-tags">${d.hobbies.map(h=>`<span class="cv-hobby-tag">${h}</span>`).join('')}</div></div>` : ''}
      </div>
      <div class="cv-main">
        ${buildSummarySection(d.summary)}
        ${buildExperienceSection(d.experience)}
        ${buildEducationSection(d.education)}
        ${buildCertSection(d.certifications)}
        ${buildProjectSection(d.projects)}
        ${buildVolunteerSection(d.volunteer)}
        ${buildAwardSection(d.awards)}
        ${buildPublicationSection(d.publications)}
        ${buildReferenceSection(d.references)}
      </div>
    </div>`;
  return header + body;
}

function buildEuropassCV(d, fullName, photoHTML) {
  const p = d.personal;
  const stars = Array(12).fill('★').join(' ');

  const contactItems = [];
  if (p.city || p.country) contactItems.push({ icon:'fa-map-marker-alt', text:[p.city,p.country].filter(Boolean).join(', ') });
  if (p.phone) contactItems.push({ icon:'fa-phone', text:p.phone });
  if (p.email) contactItems.push({ icon:'fa-envelope', text:p.email });
  if (p.linkedin) contactItems.push({ icon:'fa-linkedin fab', text:p.linkedin });
  if (p.website) contactItems.push({ icon:'fa-globe', text:p.website });
  if (p.github) contactItems.push({ icon:'fa-github fab', text:p.github });

  const detailItems = [];
  if (p.birthDate) detailItems.push({ icon:'fa-calendar', label:'Doğum Tarihi', text:formatDate(p.birthDate) });
  if (p.nationality) detailItems.push({ icon:'fa-flag', label:'Milliyet', text:p.nationality });
  if (p.gender) detailItems.push({ icon:'fa-user', label:'Cinsiyet', text:p.gender });
  if (p.maritalStatus) detailItems.push({ icon:'fa-heart', label:'Medeni Durum', text:p.maritalStatus });
  if (p.drivingLicense) detailItems.push({ icon:'fa-car', label:'Ehliyet', text:p.drivingLicense });

  const contactHTML = contactItems.map(c => `<span class="ep-contact-item"><i class="fas ${c.icon}"></i>${c.text}</span>`).join('');
  const detailsHTML = detailItems.map(di => `<div class="ep-detail-item"><i class="fas ${di.icon}"></i><span class="ep-detail-label">${di.label}:</span> ${di.text}</div>`).join('');

  const allSkills = [...(d.skills.technical||[]),...(d.skills.software||[]),...(d.skills.soft||[])];
  const skillsHTML = allSkills.length ? `
    <div class="ep-section">
      <div class="ep-section-title"><i class="fas fa-star"></i> Beceriler</div>
      <div class="ep-timeline-entry">
        <div class="ep-date"></div>
        <div class="ep-content">
          ${d.skills.technical.length ? `<div class="ep-skill-group"><strong>Teknik Beceriler</strong><div class="ep-skill-tags">${d.skills.technical.map(s=>`<span class="ep-skill-chip">${s.name}</span>`).join('')}</div></div>` : ''}
          ${d.skills.software.length ? `<div class="ep-skill-group"><strong>Yazılım &amp; Araçlar</strong><div class="ep-skill-tags">${d.skills.software.map(s=>`<span class="ep-skill-chip">${s.name}</span>`).join('')}</div></div>` : ''}
          ${d.skills.soft.length ? `<div class="ep-skill-group"><strong>Kişisel Beceriler</strong><div class="ep-skill-tags">${d.skills.soft.map(s=>`<span class="ep-skill-chip">${s.name}</span>`).join('')}</div></div>` : ''}
        </div>
      </div>
    </div>` : '';

  const hobbyHTML = d.hobbies.length ? `
    <div class="ep-section">
      <div class="ep-section-title"><i class="fas fa-heart"></i> Hobiler &amp; İlgi Alanları</div>
      <div class="ep-timeline-entry">
        <div class="ep-date"></div>
        <div class="ep-content ep-skill-tags">${d.hobbies.map(h=>`<span class="ep-skill-chip">${h}</span>`).join('')}</div>
      </div>
    </div>` : '';

  const summaryHTML = (d.summary.text || d.summary.objective) ? `
    <div class="ep-section">
      <div class="ep-section-title"><i class="fas fa-align-left"></i> Profesyonel Özet</div>
      <div class="ep-timeline-entry">
        <div class="ep-date"></div>
        <div class="ep-content">
          ${d.summary.text ? `<div class="ep-entry-desc">${nl2br(d.summary.text)}</div>` : ''}
          ${d.summary.objective ? `<div class="ep-entry-desc" style="margin-top:5px;font-style:italic;color:#64748b">${nl2br(d.summary.objective)}</div>` : ''}
        </div>
      </div>
    </div>` : '';

  return `
    <div class="cv-header">
      <span class="eu-cv-label">Curriculum Vitae</span>
      <span class="eu-stars">${stars}</span>
    </div>
    <div class="ep-name-section">
      <div>
        <div class="ep-name">${fullName}</div>
        ${p.jobTitle ? `<div class="ep-jobtitle">${p.jobTitle}</div>` : ''}
        ${contactHTML ? `<div class="ep-contacts">${contactHTML}</div>` : ''}
        ${detailsHTML ? `<div class="ep-details">${detailsHTML}</div>` : ''}
      </div>
      ${photoHTML}
    </div>
    <div class="cv-body">
      <div class="cv-main ep-main">
        ${summaryHTML}
        ${buildEpExperience(d.experience)}
        ${buildEpEducation(d.education)}
        ${buildEpLanguages(d.languages)}
        ${skillsHTML}
        ${buildEpCertSection(d.certifications)}
        ${buildEpProjectSection(d.projects)}
        ${buildEpVolunteerSection(d.volunteer)}
        ${buildEpAwardSection(d.awards)}
        ${buildEpPublicationSection(d.publications)}
        ${hobbyHTML}
        ${buildEpReferenceSection(d.references)}
      </div>
    </div>`;
}

function buildEpExperience(items) {
  if (!items.length) return '';
  const rows = items.map(i => `
    <div class="ep-timeline-entry">
      <div class="ep-date">${formatPeriod(i.start, i.end)}</div>
      <div class="ep-content">
        <div class="ep-entry-title">${i.title || 'Pozisyon'}</div>
        ${i.company ? `<div class="ep-entry-org">${i.company}${i.location ? ', ' + i.location : ''}${i.emptype ? ' · ' + i.emptype : ''}</div>` : ''}
        ${i.desc ? `<div class="ep-entry-desc">${nl2br(i.desc)}</div>` : ''}
      </div>
    </div>`).join('');
  return `<div class="ep-section"><div class="ep-section-title"><i class="fas fa-briefcase"></i> İş Deneyimi</div>${rows}</div>`;
}

function buildEpEducation(items) {
  if (!items.length) return '';
  const rows = items.map(i => `
    <div class="ep-timeline-entry">
      <div class="ep-date">${formatPeriod(i.start, i.end)}</div>
      <div class="ep-content">
        <div class="ep-entry-title">${[i.degree, i.field].filter(Boolean).join(' – ') || 'Eğitim'}</div>
        ${i.school ? `<div class="ep-entry-org">${i.school}${i.gpa ? ' · GPA: ' + i.gpa : ''}</div>` : ''}
        ${i.desc ? `<div class="ep-entry-desc">${nl2br(i.desc)}</div>` : ''}
      </div>
    </div>`).join('');
  return `<div class="ep-section"><div class="ep-section-title"><i class="fas fa-graduation-cap"></i> Eğitim ve Öğretim</div>${rows}</div>`;
}

function buildEpLanguages(langs) {
  if (!langs.length) return '';
  const cefrLabels = ['A1','A2','B1','B2','C1','C2'];
  const rows = langs.map(l => {
    const idx = Math.min(Math.max((parseInt(l.level) || 3) - 1, 0), 5);
    const lvl = cefrLabels[idx];
    const cls = `ep-cefr-${lvl.toLowerCase()}`;
    return `<tr>
      <td class="ep-lang-name">${l.name}</td>
      <td class="ep-cefr-cell ${cls}">${lvl}</td>
      <td class="ep-cefr-cell ${cls}">${lvl}</td>
      <td class="ep-cefr-cell ${cls}">${lvl}</td>
      <td class="ep-cefr-cell ${cls}">${lvl}</td>
      <td class="ep-cefr-cell ${cls}">${lvl}</td>
    </tr>`;
  }).join('');
  return `
    <div class="ep-section">
      <div class="ep-section-title"><i class="fas fa-language"></i> Dil Becerileri</div>
      <div class="ep-timeline-entry">
        <div class="ep-date"></div>
        <div class="ep-content">
          <table class="eu-lang-table">
            <thead>
              <tr class="eu-lang-thead-top">
                <th rowspan="2">Dil</th>
                <th colspan="2">Anlama</th>
                <th colspan="2">Konuşma</th>
                <th>Yazma</th>
              </tr>
              <tr class="eu-lang-thead-sub">
                <th>Okuma</th><th>Dinleme</th><th>Etkileşim</th><th>Sunum</th><th>Yazma</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <div class="eu-cefr-note">(*) Ortak Avrupa Dil Çerçevesi (CEFR): A1/A2 Başlangıç · B1/B2 Bağımsız · C1/C2 İleri</div>
        </div>
      </div>
    </div>`;
}

function buildEpCertSection(items) {
  if (!items.length) return '';
  const rows = items.map(i => `
    <div class="ep-timeline-entry">
      <div class="ep-date">${formatMonth(i.date)}</div>
      <div class="ep-content">
        <div class="ep-entry-title">${i.name}</div>
        ${i.issuer ? `<div class="ep-entry-org">${i.issuer}${i.validity ? ' · ' + i.validity : ''}</div>` : ''}
      </div>
    </div>`).join('');
  return `<div class="ep-section"><div class="ep-section-title"><i class="fas fa-certificate"></i> Sertifikalar</div>${rows}</div>`;
}

function buildEpProjectSection(items) {
  if (!items.length) return '';
  const rows = items.map(i => `
    <div class="ep-timeline-entry">
      <div class="ep-date">${formatMonth(i.date)}</div>
      <div class="ep-content">
        <div class="ep-entry-title">${i.name}</div>
        ${i.role ? `<div class="ep-entry-org">${i.role}</div>` : ''}
        ${i.tech ? `<div class="ep-skill-tags" style="margin:3px 0">${i.tech.split(',').map(t=>`<span class="ep-skill-chip">${t.trim()}</span>`).join('')}</div>` : ''}
        ${i.desc ? `<div class="ep-entry-desc">${nl2br(i.desc)}</div>` : ''}
      </div>
    </div>`).join('');
  return `<div class="ep-section"><div class="ep-section-title"><i class="fas fa-code"></i> Projeler</div>${rows}</div>`;
}

function buildEpVolunteerSection(items) {
  if (!items.length) return '';
  const rows = items.map(i => `
    <div class="ep-timeline-entry">
      <div class="ep-date">${formatPeriod(i.start, i.end)}</div>
      <div class="ep-content">
        <div class="ep-entry-title">${i.org}</div>
        ${i.role ? `<div class="ep-entry-org">${i.role}</div>` : ''}
        ${i.desc ? `<div class="ep-entry-desc">${nl2br(i.desc)}</div>` : ''}
      </div>
    </div>`).join('');
  return `<div class="ep-section"><div class="ep-section-title"><i class="fas fa-hands-helping"></i> Gönüllü Çalışmalar</div>${rows}</div>`;
}

function buildEpAwardSection(items) {
  if (!items.length) return '';
  const rows = items.map(i => `
    <div class="ep-timeline-entry">
      <div class="ep-date">${formatMonth(i.date)}</div>
      <div class="ep-content">
        <div class="ep-entry-title">${i.name}</div>
        ${i.issuer ? `<div class="ep-entry-org">${i.issuer}</div>` : ''}
        ${i.desc ? `<div class="ep-entry-desc">${nl2br(i.desc)}</div>` : ''}
      </div>
    </div>`).join('');
  return `<div class="ep-section"><div class="ep-section-title"><i class="fas fa-trophy"></i> Ödüller &amp; Başarılar</div>${rows}</div>`;
}

function buildEpPublicationSection(items) {
  if (!items.length) return '';
  const rows = items.map(i => `
    <div class="ep-timeline-entry">
      <div class="ep-date">${formatMonth(i.date)}</div>
      <div class="ep-content">
        <div class="ep-entry-title">${i.title}</div>
        ${i.publisher ? `<div class="ep-entry-org">${i.publisher}</div>` : ''}
      </div>
    </div>`).join('');
  return `<div class="ep-section"><div class="ep-section-title"><i class="fas fa-book"></i> Yayınlar</div>${rows}</div>`;
}

function buildEpReferenceSection(refs) {
  if (!refs || refs.display === 'none') return '';
  if (refs.display === 'request') return `
    <div class="ep-section">
      <div class="ep-section-title"><i class="fas fa-user-check"></i> Referanslar</div>
      <div class="ep-timeline-entry">
        <div class="ep-date"></div>
        <div class="ep-content ep-entry-desc" style="font-style:italic">İstek üzerine sunulacaktır.</div>
      </div>
    </div>`;
  if (!refs.items || !refs.items.length) return '';
  const rows = refs.items.map(r => `
    <div class="ep-timeline-entry">
      <div class="ep-date"></div>
      <div class="ep-content">
        <div class="ep-entry-title">${r.name}</div>
        <div class="ep-entry-org">${[r.title, r.company].filter(Boolean).join(' – ')}</div>
        <div class="ep-entry-desc">${[r.email, r.phone].filter(Boolean).join(' | ')}${r.relation ? ' · ' + r.relation : ''}</div>
      </div>
    </div>`).join('');
  return `<div class="ep-section"><div class="ep-section-title"><i class="fas fa-user-check"></i> Referanslar</div>${rows}</div>`;
}

function buildMinimalCV(d, fullName, photoHTML, contacts, sideInfo) {
  const p = d.personal;
  const header = `
    <div class="cv-header">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <div class="cv-name" style="color:#0f172a;font-size:32px">${fullName}</div>
          ${p.jobTitle ? `<div class="cv-job-title" style="color:#64748b;font-size:16px;margin-top:6px">${p.jobTitle}</div>` : ''}
        </div>
        ${photoHTML}
      </div>
      ${contacts.length ? `<div class="cv-contact-info" style="margin-top:16px">${contacts.map(c=>c.replace('opacity:.9','opacity:.7').replace('color:#fff','color:#374151')).join('')}</div>` : ''}
    </div>`;

  const allSkills = [...(d.skills.technical||[]), ...(d.skills.software||[]), ...(d.skills.soft||[])];
  const skillTags = allSkills.map(s=>`<span class="cv-skill-tag">${s.name}</span>`).join('');

  const body = `
    <div class="cv-body">
      <div class="cv-main">
        ${buildSummarySection(d.summary)}
        ${buildExperienceSection(d.experience)}
        ${buildEducationSection(d.education)}
        ${allSkills.length ? `<div class="cv-section"><div class="cv-section-title">Beceriler</div><div>${skillTags}</div></div>` : ''}
        ${buildLanguagesInline(d.languages)}
        ${buildCertSection(d.certifications)}
        ${buildProjectSection(d.projects)}
        ${buildVolunteerSection(d.volunteer)}
        ${buildAwardSection(d.awards)}
        ${buildPublicationSection(d.publications)}
        ${d.hobbies.length ? `<div class="cv-section"><div class="cv-section-title">Hobiler</div><div class="cv-hobby-tags">${d.hobbies.map(h=>`<span class="cv-hobby-tag">${h}</span>`).join('')}</div></div>` : ''}
        ${buildReferenceSection(d.references)}
      </div>
    </div>`;
  return header + body;
}

function buildSummarySection(s) {
  if (!s.text && !s.objective) return '';
  let html = '<div class="cv-section"><div class="cv-section-title">Profesyonel Özet</div>';
  if (s.text) html += `<div class="cv-summary-text">${nl2br(s.text)}</div>`;
  if (s.objective) html += `<div class="cv-summary-text" style="margin-top:8px;font-style:italic;color:#64748b">${nl2br(s.objective)}</div>`;
  return html + '</div>';
}

function buildExperienceSection(items) {
  if (!items.length) return '';
  const rows = items.map(i => {
    const period = formatPeriod(i.start, i.end);
    return `<div class="cv-item">
      <div class="cv-item-header">
        <span class="cv-item-title">${i.title || 'Pozisyon'}</span>
        <span class="cv-item-date">${period}</span>
      </div>
      ${i.company ? `<div class="cv-item-sub">${i.company}${i.location ? ' · ' + i.location : ''}${i.emptype ? ' · ' + i.emptype : ''}</div>` : ''}
      ${i.desc ? `<div class="cv-item-desc">${nl2br(i.desc)}</div>` : ''}
    </div>`;
  }).join('');
  return `<div class="cv-section"><div class="cv-section-title">İş Deneyimi</div>${rows}</div>`;
}

function buildEducationSection(items) {
  if (!items.length) return '';
  const rows = items.map(i => {
    const period = formatPeriod(i.start, i.end);
    return `<div class="cv-item">
      <div class="cv-item-header">
        <span class="cv-item-title">${i.school || 'Okul'}</span>
        <span class="cv-item-date">${period}</span>
      </div>
      ${(i.degree||i.field) ? `<div class="cv-item-sub">${[i.degree,i.field].filter(Boolean).join(' – ')}${i.gpa ? ' · GPA: ' + i.gpa : ''}</div>` : ''}
      ${i.desc ? `<div class="cv-item-desc">${nl2br(i.desc)}</div>` : ''}
    </div>`;
  }).join('');
  return `<div class="cv-section"><div class="cv-section-title">Eğitim</div>${rows}</div>`;
}

function buildSkillsSidebar(skills) {
  const all = [
    ...skills.technical.map(s => ({...s, cat:'Teknik'})),
    ...skills.software.map(s => ({...s, cat:'Yazılım'})),
    ...skills.soft.map(s => ({...s, cat:'Kişisel'}))
  ];
  if (!all.length) return '';
  const bars = all.map(s => `
    <div class="cv-skill-bar-wrap">
      <div class="cv-skill-label"><span>${s.name}</span><span>${levelLabel(s.level)}</span></div>
      <div class="cv-skill-bar"><div class="cv-skill-bar-fill" style="width:${s.level}%"></div></div>
    </div>`).join('');
  return `<div class="cv-section"><div class="cv-section-title">Beceriler</div>${bars}</div>`;
}

function buildLanguagesSidebar(langs) {
  if (!langs.length) return '';
  const rows = langs.map(l => {
    const lvl = parseInt(l.level) || 3;
    const dots = Array.from({length:6}, (_,i) => `<div class="cv-lang-dot${i<lvl?' filled':''}"></div>`).join('');
    return `<div class="cv-lang-item">
      <div class="cv-lang-name">${l.name}</div>
      <div class="cv-lang-level">${langLabel(lvl)}</div>
      <div class="cv-lang-dots">${dots}</div>
    </div>`;
  }).join('');
  return `<div class="cv-section"><div class="cv-section-title">Diller</div>${rows}</div>`;
}

function buildLanguagesInline(langs) {
  if (!langs.length) return '';
  const rows = langs.map(l => {
    const lvl = parseInt(l.level) || 3;
    return `<span style="margin-right:16px;font-size:13px"><strong>${l.name}</strong> <span style="color:#64748b">${langLabel(lvl)}</span></span>`;
  }).join('');
  return `<div class="cv-section"><div class="cv-section-title">Diller</div><div style="padding:4px 0">${rows}</div></div>`;
}

function buildCertSection(items) {
  if (!items.length) return '';
  const rows = items.map(i => `<div class="cv-item">
    <div class="cv-item-header">
      <span class="cv-item-title">${i.name}</span>
      <span class="cv-item-date">${formatMonth(i.date)}</span>
    </div>
    ${i.issuer ? `<div class="cv-item-sub">${i.issuer}${i.validity ? ' · ' + i.validity : ''}</div>` : ''}
  </div>`).join('');
  return `<div class="cv-section"><div class="cv-section-title">Sertifikalar</div>${rows}</div>`;
}

function buildProjectSection(items) {
  if (!items.length) return '';
  const rows = items.map(i => `<div class="cv-item">
    <div class="cv-item-header">
      <span class="cv-item-title">${i.name}</span>
      <span class="cv-item-date">${formatMonth(i.date)}</span>
    </div>
    ${i.role ? `<div class="cv-item-sub">${i.role}</div>` : ''}
    ${i.tech ? `<div style="margin:4px 0">${i.tech.split(',').map(t=>`<span class="cv-skill-tag">${t.trim()}</span>`).join('')}</div>` : ''}
    ${i.desc ? `<div class="cv-item-desc">${nl2br(i.desc)}</div>` : ''}
  </div>`).join('');
  return `<div class="cv-section"><div class="cv-section-title">Projeler</div>${rows}</div>`;
}

function buildVolunteerSection(items) {
  if (!items.length) return '';
  const rows = items.map(i => `<div class="cv-item">
    <div class="cv-item-header">
      <span class="cv-item-title">${i.org}</span>
      <span class="cv-item-date">${formatPeriod(i.start, i.end)}</span>
    </div>
    ${i.role ? `<div class="cv-item-sub">${i.role}</div>` : ''}
    ${i.desc ? `<div class="cv-item-desc">${nl2br(i.desc)}</div>` : ''}
  </div>`).join('');
  return `<div class="cv-section"><div class="cv-section-title">Gönüllü Çalışmalar</div>${rows}</div>`;
}

function buildAwardSection(items) {
  if (!items.length) return '';
  const rows = items.map(i => `<div class="cv-item">
    <div class="cv-item-header">
      <span class="cv-item-title">${i.name}</span>
      <span class="cv-item-date">${formatMonth(i.date)}</span>
    </div>
    ${i.issuer ? `<div class="cv-item-sub">${i.issuer}</div>` : ''}
    ${i.desc ? `<div class="cv-item-desc">${nl2br(i.desc)}</div>` : ''}
  </div>`).join('');
  return `<div class="cv-section"><div class="cv-section-title">Ödüller</div>${rows}</div>`;
}

function buildPublicationSection(items) {
  if (!items.length) return '';
  const rows = items.map(i => `<div class="cv-item">
    <div class="cv-item-header">
      <span class="cv-item-title">${i.title}</span>
      <span class="cv-item-date">${formatMonth(i.date)}</span>
    </div>
    ${i.publisher ? `<div class="cv-item-sub">${i.publisher}</div>` : ''}
  </div>`).join('');
  return `<div class="cv-section"><div class="cv-section-title">Yayınlar</div>${rows}</div>`;
}

function buildReferenceSection(refs) {
  if (!refs) return '';
  if (refs.display === 'none') return '';
  if (refs.display === 'request') return `<div class="cv-section"><div class="cv-section-title">Referanslar</div><div class="cv-request-text">Referanslar istek üzerine sunulacaktır.</div></div>`;
  if (!refs.items || !refs.items.length) return '';
  const rows = refs.items.map(r => `<div class="cv-ref-item">
    <div class="cv-ref-name">${r.name}</div>
    <div class="cv-ref-title">${[r.title, r.company].filter(Boolean).join(' – ')}</div>
    <div class="cv-ref-contact">${[r.email, r.phone].filter(Boolean).join(' | ')}${r.relation ? ' · ' + r.relation : ''}</div>
  </div>`).join('');
  return `<div class="cv-section"><div class="cv-section-title">Referanslar</div>${rows}</div>`;
}

function formatMonth(m) {
  if (!m) return '';
  const [y, mo] = m.split('-');
  const months = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
  return months[parseInt(mo)-1] + ' ' + y;
}

function formatPeriod(start, end) {
  const s = formatMonth(start);
  const e = end ? formatMonth(end) : 'Devam ediyor';
  if (!s) return e !== 'Devam ediyor' ? e : '';
  return s + ' – ' + e;
}

function formatDate(d) {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${day}.${m}.${y}`;
}

function levelLabel(val) {
  const v = parseInt(val);
  if (v <= 20) return 'Başlangıç';
  if (v <= 40) return 'Temel';
  if (v <= 60) return 'Orta';
  if (v <= 80) return 'İleri';
  return 'Uzman';
}

function langLabel(lvl) {
  const labels = ['','A1 Başlangıç','A2 Temel','B1 Orta','B2 Orta Üstü','C1 İleri','C2 Anadil'];
  return labels[lvl] || '';
}

function nl2br(str) {
  return str.replace(/\n/g, '<br>');
}

function saveCV() {
  const data = collectData();
  if (!data.personal.firstName && !data.personal.lastName && !data.title) {
    showToast('Lütfen en azından adınızı girin.', 'error');
    return;
  }
  const cvs = loadAllCVs();
  if (!currentCVId) currentCVId = 'cv_' + Date.now();
  data.id = currentCVId;
  data.savedAt = new Date().toLocaleString('tr-TR');
  cvs[currentCVId] = data;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cvs));
    showToast('CV başarıyla kaydedildi!', 'success');
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014) {
      try {
        cvs[currentCVId] = { ...data, photo: null };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cvs));
        showToast('CV kaydedildi (fotoğraf boyut nedeniyle hariç tutuldu)', 'success');
      } catch (e2) {
        showToast('Depolama alanı dolu, CV kaydedilemedi', 'error');
      }
    } else {
      showToast('Kayıt sırasında hata oluştu', 'error');
      console.error(e);
    }
  }
}

function loadAllCVs() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
}

function loadCV(id) {
  const cvs = loadAllCVs();
  const data = cvs[id];
  if (!data) return;
  currentCVId = id;
  currentTheme = data.theme || 'classic';
  photoDataUrl = data.photo || null;

  resetForm();
  applyTheme(currentTheme);
  selectTheme(currentTheme);

  const p = data.personal || {};
  setVal('cvTitle', data.title);
  Object.keys(p).forEach(k => setVal(k, p[k]));
  setVal('jobTitleTop', p.jobTitle || '');
  setVal('summary', data.summary?.text);
  setVal('objective', data.summary?.objective);
  setVal('referenceDisplay', data.references?.display);

  if (data.photo) {
    photoDataUrl = data.photo;
    document.getElementById('photoPreview').innerHTML = `<img src="${data.photo}" />`;
  }
  const showPhotoEl = document.getElementById('showPhoto');
  if (showPhotoEl) showPhotoEl.checked = data.showPhoto !== false;

  restoreList('experience', data.experience || [], ['title','company','start','end','location','emptype','desc']);
  restoreList('education', data.education || [], ['school','field','degree','start','end','gpa','desc']);
  restoreList('language', data.languages || [], ['name','level']);
  restoreList('certification', data.certifications || [], ['name','issuer','date','validity','url']);
  restoreList('project', data.projects || [], ['name','role','date','tech','desc','url']);
  restoreList('volunteer', data.volunteer || [], ['org','role','start','end','desc']);
  restoreList('award', data.awards || [], ['name','issuer','date','desc']);
  restoreList('publication', data.publications || [], ['title','publisher','date','url']);
  restoreList('reference', data.references?.items || [], ['name','title','company','email','phone','relation']);

  restoreSkills('technical', data.skills?.technical || []);
  restoreSkills('software', data.skills?.software || []);
  restoreSkills('soft', data.skills?.soft || []);

  hobbies = data.hobbies || [];
  renderHobbies();

  showPage('editor');
  updatePreview();
  showToast('CV yüklendi!', 'success');
}

function restoreList(type, items, fields) {
  items.forEach(item => {
    addItem(type);
    const nodes = document.querySelectorAll('.dynamic-item[id^="' + type + '_"]');
    const lastNode = nodes[nodes.length - 1];
    if (!lastNode) return;
    const id = lastNode.id;
    fields.forEach(f => { if (item[f] !== undefined && item[f] !== null) setVal(id + '_' + f, item[f]); });
  });
}

function restoreSkills(cat, skills) {
  skills.forEach(s => {
    addSkill(cat);
    const nodes = document.querySelectorAll('.skill-item[id^="' + cat + '_skill_"]');
    const lastNode = nodes[nodes.length - 1];
    if (!lastNode) return;
    const id = lastNode.id;
    setVal(id + '_name', s.name);
    setVal(id + '_level', s.level);
  });
}

function setVal(id, value) {
  const el = document.getElementById(id);
  if (el && value !== undefined && value !== null) el.value = value;
}

function deleteCV(id) {
  if (!confirm('Bu CV\'yi silmek istediğinizden emin misiniz?')) return;
  const cvs = loadAllCVs();
  delete cvs[id];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cvs));
  renderCVList();
  showToast('CV silindi.', 'success');
}

function exportAllCVs() {
  const cvs = loadAllCVs();
  if (!Object.keys(cvs).length) {
    showToast('Yedeklenecek CV yok', 'error');
    return;
  }
  const payload = {
    app: 'CV Maker Pro',
    version: 1,
    exportedAt: new Date().toISOString(),
    cvs
  };
  downloadJSON(payload, `cv_maker_yedek_${new Date().toISOString().slice(0,10)}.json`);
  showToast(`${Object.keys(cvs).length} CV yedeklendi`, 'success');
}

function exportSingleCV(id) {
  const cvs = loadAllCVs();
  const cv = cvs[id];
  if (!cv) return;
  const payload = {
    app: 'CV Maker Pro',
    version: 1,
    exportedAt: new Date().toISOString(),
    cvs: { [id]: cv }
  };
  const safeName = (cv.title || (cv.personal && [cv.personal.firstName, cv.personal.lastName].filter(Boolean).join('_')) || 'cv')
    .replace(/[^\w\-_.çğıöşüÇĞİÖŞÜ ]/g, '').replace(/\s+/g, '_');
  downloadJSON(payload, `${safeName}_yedek.json`);
  showToast('CV indirildi', 'success');
}

function downloadJSON(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importCVs(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      const incoming = parsed && typeof parsed === 'object'
        ? (parsed.cvs && typeof parsed.cvs === 'object' ? parsed.cvs : parsed)
        : null;
      if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) {
        throw new Error('Geçersiz yedek dosyası');
      }
      const ids = Object.keys(incoming).filter(k => incoming[k] && typeof incoming[k] === 'object');
      if (!ids.length) throw new Error('Yedek dosyasında CV bulunamadı');

      const existing = loadAllCVs();
      let added = 0, replaced = 0;
      ids.forEach(id => {
        const cv = incoming[id];
        if (!cv.id) cv.id = id;
        if (existing[cv.id]) replaced++; else added++;
        existing[cv.id] = cv;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      renderCVList();
      const parts = [];
      if (added) parts.push(`${added} yeni`);
      if (replaced) parts.push(`${replaced} güncellendi`);
      showToast(`İçe aktarıldı: ${parts.join(', ')}`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Geçersiz veya bozuk JSON dosyası', 'error');
    }
  };
  reader.onerror = () => showToast('Dosya okunamadı', 'error');
  reader.readAsText(file);
  event.target.value = '';
}

function renderCVList() {
  const cvs = loadAllCVs();
  const list = document.getElementById('cvList');
  const entries = Object.values(cvs);
  if (!entries.length) {
    list.innerHTML = `<div class="empty-state"><i class="fas fa-folder-open"></i><h3>Henüz CV oluşturmadınız</h3><p>Yeni bir CV oluşturmak için yukarıdaki butona tıklayın.</p></div>`;
    return;
  }
  list.innerHTML = entries.reverse().map(cv => {
    const name = cv.personal ? [cv.personal.firstName, cv.personal.lastName].filter(Boolean).join(' ') : '';
    const themeColors = { classic:'#2563eb', modern:'#7c3aed', creative:'#db2777', minimal:'#374151', executive:'#b45309', europass:'#003399' };
    const color = themeColors[cv.theme] || '#2563eb';
    return `<div class="cv-card">
      <div class="cv-card-title">${cv.title || 'Başlıksız CV'}</div>
      ${name ? `<div class="cv-card-meta"><i class="fas fa-user" style="color:${color}"></i> ${name}</div>` : ''}
      <div class="cv-card-meta"><i class="fas fa-clock"></i> ${cv.savedAt || ''}</div>
      <span class="cv-card-theme" style="background:${color}20;color:${color}">${(cv.theme||'classic').charAt(0).toUpperCase()+(cv.theme||'classic').slice(1)}</span>
      <div class="cv-card-actions">
        <button class="btn btn-primary btn-sm" onclick="loadCV('${cv.id}')"><i class="fas fa-edit"></i> Düzenle</button>
        <button class="btn btn-secondary btn-sm" onclick="exportSingleCV('${cv.id}')" title="Bu CV'yi JSON olarak indir"><i class="fas fa-download"></i></button>
        <button class="btn btn-danger btn-sm" onclick="deleteCV('${cv.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>`;
  }).join('');
}

function exportPDF() {
  const data = collectData();
  const name = [data.personal.firstName, data.personal.lastName].filter(Boolean).join('_') || 'CV';
  const element = document.getElementById('cvPreview');
  const opt = {
    margin: 0,
    filename: name + '_CV.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
    pagebreak: { mode: ['css', 'legacy'] }
  };
  showToast('PDF hazırlanıyor...', '');
  html2pdf().set(opt).from(element).save().then(() => {
    showToast('PDF başarıyla indirildi!', 'success');
  }).catch(err => {
    console.error(err);
    showToast('PDF oluşturulamadı', 'error');
  });
}

function resetForm() {
  const inputs = ['cvTitle','jobTitleTop','firstName','lastName','jobTitle','email','phone','city','country',
    'birthDate','maritalStatus','drivingLicense','linkedin','website','github','address',
    'nationality','gender','summary','objective','referenceDisplay'];
  inputs.forEach(id => setVal(id, ''));

  ['experienceList','educationList','languageList','certificationList','projectList',
   'volunteerList','awardList','publicationList','referenceList',
   'technicalSkillList','softwareSkillList','softSkillList'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '';
  });

  Object.keys(itemCounts).forEach(k => delete itemCounts[k]);
  Object.keys(skillCounts).forEach(k => skillCounts[k] = 0);
  hobbies = [];
  renderHobbies();
  photoDataUrl = null;
  document.getElementById('photoPreview').innerHTML = '<i class="fas fa-camera"></i><span>Fotoğraf Ekle</span>';
}

function showToast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast' + (type ? ' ' + type : '') + ' show';
  setTimeout(() => t.classList.remove('show'), 3000);
}

function syncJobTitle(value) {
  const el = document.getElementById('jobTitle');
  if (el) el.value = value;
  updatePreview();
}

function onJobTitleChange(value) {
  const top = document.getElementById('jobTitleTop');
  if (top) top.value = value;
  updatePreview();
}

document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  const jt = document.getElementById('jobTitle');
  if (jt) jt.addEventListener('input', () => onJobTitleChange(jt.value));
  updatePreview();
  const sum = document.getElementById('summary');
  if (sum) sum.addEventListener('input', () => {
    document.getElementById('summaryCount').textContent = sum.value.length;
  });
});
