const API = '/api';
let courses  = [];
let students = [];

// ── INIT ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.nav-link').forEach(function(a) {
        a.addEventListener('click', function(e) {
            e.preventDefault();
            go(a.dataset.page);
        });
    });
    go('dashboard');
});

const titles = { dashboard:'Dashboard', courses:'Courses', students:'Students', enrollments:'Enrollments', grades:'Grades', report:'Report' };

function go(page) {
    document.querySelectorAll('.nav-link').forEach(function(a) { a.classList.remove('active'); });
    var nav = document.querySelector('[data-page="' + page + '"]');
    if (nav) nav.classList.add('active');
    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
    var pg = document.getElementById('page-' + page);
    if (pg) pg.classList.add('active');
    document.getElementById('pageTitle').textContent = titles[page] || page;
    // Clear search boxes every time so stale filter text never hides fresh data
    var cs = document.getElementById('courseSearch');
    var ss = document.getElementById('studentSearch');
    if (cs) cs.value = '';
    if (ss) ss.value = '';
    if (page === 'dashboard')   loadDashboard();
    if (page === 'courses')     loadCourses();
    if (page === 'students')    loadStudents();
    if (page === 'enrollments') loadEnrollPage();
    if (page === 'grades')      loadGradePage();
}

// ── TOAST ─────────────────────────────────────────────
var _toastTimer;
function toast(msg, type) {
    var t = document.getElementById('toast');
    t.textContent = (type === 'error' ? '✕  ' : '✓  ') + msg;
    t.className = 'toast show ' + (type || 'success');
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(function() { t.classList.remove('show'); }, 3500);
}

// ── MODALS ────────────────────────────────────────────
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-bg')) e.target.classList.remove('open');
});

// ── API ───────────────────────────────────────────────
async function api(url, method, body) {
    method = method || 'GET';
    var opts = { method: method, headers: { 'Content-Type': 'application/json' } };
    if (body !== undefined) opts.body = JSON.stringify(body);
    try {
        var res = await fetch(API + url, opts);
        var data = null;
        try { data = await res.json(); } catch(e) { data = {}; }
        return { ok: res.ok, data: data, status: res.status };
    } catch(e) {
        return { ok: false, data: { error: 'Network error' }, status: 0 };
    }
}

// ── HELPERS ───────────────────────────────────────────
function g(id)      { var e = document.getElementById(id); return e ? e.value.trim() : ''; }
function s(id, val) { var e = document.getElementById(id); if (e) e.value = val == null ? '' : val; }
function clr(ids)   { ids.forEach(function(id) { s(id, ''); }); }
function ini(name)  { return (name || '?').charAt(0).toUpperCase(); }

function setBusy(btn, busy, label) {
    if (!btn) return;
    btn.disabled = busy;
    btn.textContent = busy ? '⏳ ' + label : label;
}

function skel(cols, rows) {
    rows = rows || 4;
    return Array(rows).fill('').map(function() {
        return '<tr>' + Array(cols).fill('<td><div class="skel" style="width:80%;height:12px"></div></td>').join('') + '</tr>';
    }).join('');
}

// ── DASHBOARD ─────────────────────────────────────────
async function loadDashboard() {
    var res = await Promise.all([api('/enrollments/stats'), api('/courses'), api('/students')]);
    var stats = res[0].data || {};
    courses  = res[1].data || [];
    students = res[2].data || [];

    animN('statCourses',     stats.totalCourses     || 0);
    animN('statStudents',    stats.totalStudents    || 0);
    animN('statEnrollments', stats.totalEnrollments || 0);
    animN('statAvailable',   stats.availableCourses || 0);

    renderDashCourses();
    renderDashStudents();
}

function renderDashCourses() {
    var el = document.getElementById('dashCourseGrid');
    if (!courses.length) {
        el.innerHTML = '<div class="empty"><p>No courses yet.</p><button class="btn btn-primary" style="margin-top:12px" onclick="go(\'courses\')">+ Add Course</button></div>';
        return;
    }
    el.innerHTML = courses.map(function(c) {
        var pct = c.maxStrength > 0 ? Math.min(Math.round((c.enrolledCount / c.maxStrength) * 100), 100) : 0;
        var bc  = pct >= 100 ? 'full' : pct >= 75 ? 'warn' : '';
        return '<div class="c-card" onclick="go(\'courses\')">' +
            '<div class="c-card-top"><span class="c-code">' + (c.courseCode||'') + '</span>' +
            '<span class="badge ' + (c.available ? 'badge-open' : 'badge-full') + '">' + (c.available ? 'Open' : 'Full') + '</span></div>' +
            '<div class="c-name">' + c.courseName + '</div>' +
            '<div class="c-inst">' + (c.instructor ? '👤 ' + c.instructor : 'No instructor') + '</div>' +
            '<div class="c-meta"><span>' + c.credits + ' cr</span><span>' + c.enrolledCount + '/' + c.maxStrength + ' seats</span>' + (c.category ? '<span>' + c.category + '</span>' : '') + '</div>' +
            '<div class="seat-bar"><div class="seat-fill ' + bc + '" style="width:' + pct + '%"></div></div>' +
            '<div class="seat-pct">' + pct + '% filled</div></div>';
    }).join('');
}

function renderDashStudents() {
    var el = document.getElementById('dashStudentList');
    if (!students.length) {
        el.innerHTML = '<div class="empty"><p>No students yet.</p></div>';
        return;
    }
    el.innerHTML = students.slice(0, 8).map(function(s) {
        return '<div class="s-row" onclick="go(\'students\')">' +
            '<div class="s-av">' + ini(s.name) + '</div>' +
            '<div class="s-info"><div class="s-name">' + s.name + '</div>' +
            '<div class="s-roll">' + s.rollNo + (s.department ? ' · ' + s.department : '') + '</div></div>' +
            '<span class="badge badge-grade">' + s.enrolledCoursesCount + ' course' + (s.enrolledCoursesCount !== 1 ? 's' : '') + '</span></div>';
    }).join('');
}

function animN(id, target) {
    var el = document.getElementById(id); if (!el) return;
    var n = 0, step = 0;
    el.textContent = '0';
    var t = setInterval(function() {
        step++;
        n = Math.min(n + target / 40, target);
        el.textContent = Math.floor(n);
        if (step >= 40) { el.textContent = target; clearInterval(t); }
    }, 15);
}

// ── COURSES ───────────────────────────────────────────
async function loadCourses() {
    document.getElementById('courseTbody').innerHTML = skel(9);
    var r = await api('/courses');
    courses = r.data || [];
    renderCourses(courses);
}

function renderCourses(list) {
    var tb = document.getElementById('courseTbody');
    if (!list.length) {
        tb.innerHTML = '<tr><td colspan="9"><div class="empty"><p>No courses yet. Add one!</p></div></td></tr>';
        return;
    }
    tb.innerHTML = list.map(function(c) {
        var pct = c.maxStrength > 0 ? Math.min(Math.round((c.enrolledCount / c.maxStrength) * 100), 100) : 0;
        var bc  = pct >= 100 ? 'full' : pct >= 75 ? 'warn' : '';
        return '<tr>' +
            '<td class="t-id">#' + c.id + '</td>' +
            '<td><code>' + c.courseCode + '</code></td>' +
            '<td class="t-name">' + c.courseName + '</td>' +
            '<td class="t-dim">'  + (c.instructor || '—') + '</td>' +
            '<td class="t-mono">' + c.credits + '</td>' +
            '<td class="t-dim">'  + (c.category || '—') + '</td>' +
            '<td><div class="mini-prog"><span class="t-mono">' + c.enrolledCount + '/' + c.maxStrength + '</span><div class="mini-bar"><div class="mini-fill ' + bc + '" style="width:' + pct + '%"></div></div></div></td>' +
            '<td><span class="badge ' + (c.available ? 'badge-open' : 'badge-full') + '">' + (c.available ? '✓ Open' : '✕ Full') + '</span></td>' +
            '<td><div class="act-btns">' +
            '<button class="btn btn-outline btn-sm" onclick="openEditCourse(' + c.id + ')">Edit</button>' +
            '<button class="btn btn-danger btn-sm"  onclick="delCourse(' + c.id + ')">Del</button>' +
            '</div></td></tr>';
    }).join('');
}

document.getElementById('courseSearch').addEventListener('input', function() {
    var q = this.value.toLowerCase();
    renderCourses(courses.filter(function(c) {
        return (c.courseName||'').toLowerCase().includes(q) ||
               (c.courseCode||'').toLowerCase().includes(q) ||
               (c.instructor||'').toLowerCase().includes(q) ||
               (c.category||'').toLowerCase().includes(q);
    }));
});

async function saveCourse() {
    var btn  = document.getElementById('btnSaveCourse');
    var body = { courseName: g('cName'), courseCode: g('cCode'), instructor: g('cInst'), category: g('cCat'), credits: parseInt(g('cCr'))||0, maxStrength: parseInt(g('cMax'))||0, description: g('cDesc') };
    if (!body.courseName) { toast('Course Name is required.', 'error'); return; }
    if (!body.courseCode) { toast('Course Code is required.', 'error'); return; }
    if (body.credits < 1 || body.credits > 10) { toast('Credits must be 1–10.', 'error'); return; }
    if (body.maxStrength < 1) { toast('Max Seats must be ≥ 1.', 'error'); return; }
    setBusy(btn, true, 'Saving...');
    var r = await api('/courses', 'POST', body);
    setBusy(btn, false, 'Save Course');
    if (r.ok) {
        toast('Course added!');
        closeModal('modalAddCourse');
        clr(['cName','cCode','cInst','cCat','cCr','cMax','cDesc']);
        await loadCourses();
        await loadDashboard();
    } else {
        toast((r.data && r.data.error) || 'Failed to add.', 'error');
    }
}

function openEditCourse(id) {
    var c = courses.find(function(x) { return x.id === id; });
    if (!c) return;
    s('eCId', c.id); s('eCName', c.courseName); s('eCCode', c.courseCode);
    s('eCInst', c.instructor || ''); s('eCCr', c.credits); s('eCMax', c.maxStrength);
    s('eCCat', c.category || ''); s('eCDesc', c.description || '');
    openModal('modalEditCourse');
}

async function updateCourse() {
    var id  = g('eCId');
    var btn = document.getElementById('btnUpdateCourse');
    if (!id) return;
    var body = { courseName: g('eCName'), courseCode: g('eCCode'), instructor: g('eCInst'), credits: parseInt(g('eCCr'))||0, maxStrength: parseInt(g('eCMax'))||0, category: g('eCCat'), description: g('eCDesc') };
    if (!body.courseName) { toast('Name required.', 'error'); return; }
    if (body.credits < 1) { toast('Credits must be ≥ 1.', 'error'); return; }
    if (body.maxStrength < 1) { toast('Max seats must be ≥ 1.', 'error'); return; }
    setBusy(btn, true, 'Updating...');
    var r = await api('/courses/' + id, 'PUT', body);
    setBusy(btn, false, 'Update Course');
    if (r.ok) {
        toast('Course updated!');
        closeModal('modalEditCourse');
        await loadCourses();
        await loadDashboard();
    } else {
        toast((r.data && r.data.error) || 'Update failed.', 'error');
    }
}

async function delCourse(id) {
    var c = courses.find(function(x) { return x.id === id; });
    if (!confirm('Delete "' + (c ? c.courseName : 'this course') + '"? All enrollments will be removed.')) return;
    var r = await api('/courses/' + id, 'DELETE');
    if (r.ok) { toast('Course deleted.'); await loadCourses(); await loadDashboard(); }
    else toast((r.data && r.data.error) || 'Delete failed.', 'error');
}

// ── STUDENTS ──────────────────────────────────────────
async function loadStudents() {
    document.getElementById('studentTbody').innerHTML = skel(8);
    var r = await api('/students');
    students = r.data || [];
    renderStudents(students);
}

function renderStudents(list) {
    var tb = document.getElementById('studentTbody');
    if (!list.length) {
        tb.innerHTML = '<tr><td colspan="8"><div class="empty"><p>No students yet.</p></div></td></tr>';
        return;
    }
    tb.innerHTML = list.map(function(st) {
        return '<tr>' +
            '<td class="t-id">#' + st.id + '</td>' +
            '<td><code>' + st.rollNo + '</code></td>' +
            '<td><div class="t-av-wrap"><div class="t-av">' + ini(st.name) + '</div><span class="t-name">' + st.name + '</span></div></td>' +
            '<td class="t-dim">'  + (st.email      || '—') + '</td>' +
            '<td class="t-dim">'  + (st.department || '—') + '</td>' +
            '<td class="t-mono">' + (st.semester > 0 ? 'Sem ' + st.semester : '—') + '</td>' +
            '<td><span class="badge badge-grade">' + st.enrolledCoursesCount + ' course' + (st.enrolledCoursesCount !== 1 ? 's' : '') + '</span></td>' +
            '<td><div class="act-btns">' +
            '<button class="btn btn-outline btn-sm" onclick="openEditStudent(' + st.id + ')">Edit</button>' +
            '<button class="btn btn-danger btn-sm"  onclick="delStudent(' + st.id + ')">Del</button>' +
            '</div></td></tr>';
    }).join('');
}

document.getElementById('studentSearch').addEventListener('input', function() {
    var q = this.value.toLowerCase();
    renderStudents(students.filter(function(st) {
        return (st.name||'').toLowerCase().includes(q) ||
               (st.rollNo||'').toLowerCase().includes(q) ||
               (st.email||'').toLowerCase().includes(q) ||
               (st.department||'').toLowerCase().includes(q);
    }));
});

async function saveStudent() {
    var btn  = document.getElementById('btnSaveStudent');
    var body = { name: g('sName'), rollNo: g('sRoll'), email: g('sEmail'), phone: g('sPhone'), department: g('sDept'), semester: parseInt(g('sSem'))||0 };
    if (!body.name)   { toast('Name is required.',   'error'); return; }
    if (!body.rollNo) { toast('Roll No is required.','error'); return; }
    setBusy(btn, true, 'Saving...');
    var r = await api('/students', 'POST', body);
    setBusy(btn, false, 'Save Student');
    if (r.ok) {
        toast('Student added!');
        closeModal('modalAddStudent');
        clr(['sName','sRoll','sEmail','sPhone','sDept','sSem']);
        await loadStudents();
        await loadDashboard();
    } else {
        toast((r.data && r.data.error) || 'Failed to add.', 'error');
    }
}

function openEditStudent(id) {
    var st = students.find(function(x) { return x.id === id; });
    if (!st) return;
    s('eSId', st.id); s('eSName', st.name); s('eSEmail', st.email||'');
    s('eSPhone', st.phone||''); s('eSDept', st.department||''); s('eSSem', st.semester||0);
    openModal('modalEditStudent');
}

async function updateStudent() {
    var id  = g('eSId');
    var btn = document.getElementById('btnUpdateStudent');
    if (!id) return;
    var st = students.find(function(x) { return x.id == id; });
    var body = { name: g('eSName'), rollNo: st ? st.rollNo : '', email: g('eSEmail'), phone: g('eSPhone'), department: g('eSDept'), semester: parseInt(g('eSSem'))||0 };
    if (!body.name) { toast('Name is required.', 'error'); return; }
    setBusy(btn, true, 'Updating...');
    var r = await api('/students/' + id, 'PUT', body);
    setBusy(btn, false, 'Update Student');
    if (r.ok) {
        toast('Student updated!');
        closeModal('modalEditStudent');
        await loadStudents();
        await loadDashboard();
    } else {
        toast((r.data && r.data.error) || 'Update failed.', 'error');
    }
}

async function delStudent(id) {
    var st = students.find(function(x) { return x.id === id; });
    if (!confirm('Delete student "' + (st ? st.name : '') + '"?')) return;
    var r = await api('/students/' + id, 'DELETE');
    if (r.ok) { toast('Student deleted.'); await loadStudents(); await loadDashboard(); }
    else toast((r.data && r.data.error) || 'Delete failed.', 'error');
}

// ── ENROLLMENTS ───────────────────────────────────────
async function loadEnrollPage() {
    var res = await Promise.all([api('/students'), api('/courses')]);
    students = res[0].data || [];
    courses  = res[1].data || [];

    // build student dropdown
    var ss = document.getElementById('selStudent');
    ss.innerHTML = '<option value="">— choose student —</option>';
    students.forEach(function(st) {
        var o = document.createElement('option');
        o.value = st.id;
        o.textContent = st.name + ' (' + st.rollNo + ')';
        ss.appendChild(o);
    });

    // build course dropdowns
    var sc = document.getElementById('selCourse');
    var sv = document.getElementById('selViewCourse');
    sc.innerHTML = '<option value="">— choose course —</option>';
    sv.innerHTML = '<option value="">— choose course —</option>';
    courses.forEach(function(c) {
        var label = c.courseCode + ' — ' + c.courseName + ' (' + c.enrolledCount + '/' + c.maxStrength + ')' + (!c.available ? ' [FULL]' : '');
        var o1 = document.createElement('option');
        o1.value = c.id; o1.textContent = label;
        sc.appendChild(o1);
        var o2 = document.createElement('option');
        o2.value = c.id; o2.textContent = label;
        sv.appendChild(o2);
    });

    document.getElementById('rosterList').innerHTML = '';
}

async function doEnroll() {
    var sid = document.getElementById('selStudent').value;
    var cid = document.getElementById('selCourse').value;
    if (!sid) { toast('Select a student.', 'error'); return; }
    if (!cid) { toast('Select a course.',  'error'); return; }
    var btn = document.getElementById('btnEnroll');
    setBusy(btn, true, 'Enrolling...');
    var r = await api('/enrollments', 'POST', { studentId: parseInt(sid), courseId: parseInt(cid) });
    setBusy(btn, false, 'Enroll Now');
    if (r.ok) {
        toast('Enrolled successfully!');
        var prevCourse = cid;
        await loadEnrollPage();
        document.getElementById('selViewCourse').value = prevCourse;
        await loadRoster();
        await loadDashboard();
    } else {
        toast((r.data && r.data.error) || 'Enrollment failed.', 'error');
    }
}

async function loadRoster() {
    var cid  = document.getElementById('selViewCourse').value;
    var list = document.getElementById('rosterList');
    if (!cid) { list.innerHTML = ''; return; }
    list.innerHTML = '<div style="color:var(--text3);font-size:13px;padding:8px 0">Loading...</div>';
    var r = await api('/enrollments/course/' + cid);
    var data = r.data || [];
    if (!data.length) {
        list.innerHTML = '<div class="empty"><p>No students enrolled yet.</p></div>';
        return;
    }
    list.innerHTML = data.map(function(e) {
        return '<div class="roster-item">' +
            '<div class="roster-left">' +
            '<div class="s-av">' + ini(e.studentName) + '</div>' +
            '<div><div class="s-name">' + e.studentName + '</div>' +
            '<div class="s-roll">' + e.rollNo + (e.department ? ' · ' + e.department : '') + '</div></div>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:8px">' +
            '<span class="badge ' + (e.grade ? 'badge-grade' : 'badge-none') + '">' + (e.grade || 'No grade') + '</span>' +
            '<button class="btn btn-danger btn-sm" onclick="doWithdraw(' + e.studentId + ',' + cid + ')">Remove</button>' +
            '</div></div>';
    }).join('');
}

async function doWithdraw(sid, cid) {
    if (!confirm('Remove this student from the course?')) return;
    var r = await api('/enrollments', 'DELETE', { studentId: parseInt(sid), courseId: parseInt(cid) });
    if (r.ok) { toast('Withdrawn.'); await loadRoster(); await loadDashboard(); }
    else toast((r.data && r.data.error) || 'Failed.', 'error');
}

// ── GRADES ────────────────────────────────────────────
async function loadGradePage() {
    var r = await api('/students');
    students = r.data || [];
    var sel = document.getElementById('selGradeStudent');
    sel.innerHTML = '<option value="">— select student to manage grades —</option>';
    students.forEach(function(st) {
        var o = document.createElement('option');
        o.value = st.id;
        o.textContent = st.name + ' (' + st.rollNo + ')';
        sel.appendChild(o);
    });
    document.getElementById('gradesContainer').innerHTML = '';
}

async function loadGrades() {
    var sid  = document.getElementById('selGradeStudent').value;
    var cont = document.getElementById('gradesContainer');
    if (!sid) { cont.innerHTML = ''; return; }
    cont.innerHTML = '<div style="color:var(--text3);padding:12px 0">Loading...</div>';
    var r    = await api('/enrollments/student/' + sid);
    var data = r.data || [];
    if (!data.length) {
        cont.innerHTML = '<div class="empty"><p>Not enrolled in any course.</p></div>';
        return;
    }
    var gc = { S:'#34d399', A:'#4f8ef7', B:'#c8a96e', C:'#fbbf24', D:'#f97316', E:'#a05cda', F:'#f87171' };
    var graded = data.filter(function(e) { return e.grade; }).length;
    var credits = data.reduce(function(sum, e) { return sum + (e.credits||0); }, 0);
    var html = '<div class="grade-summary">' +
        '<div class="gsumm"><span class="gsumm-num">' + data.length + '</span><span class="gsumm-label">Enrolled</span></div>' +
        '<div class="gsumm"><span class="gsumm-num" style="color:var(--green)">' + graded + '</span><span class="gsumm-label">Graded</span></div>' +
        '<div class="gsumm"><span class="gsumm-num" style="color:var(--text3)">' + (data.length - graded) + '</span><span class="gsumm-label">Pending</span></div>' +
        '<div class="gsumm"><span class="gsumm-num" style="color:var(--accent)">' + credits + '</span><span class="gsumm-label">Credits</span></div>' +
        '</div>';
    html += data.map(function(e) {
        var col = e.grade ? (gc[e.grade] || '#888') : null;
        var cs  = col ? 'background:' + col + '22;color:' + col + ';border-color:' + col + '55' : '';
        return '<div class="grade-row">' +
            '<div class="grade-left">' +
            '<div class="g-code">' + e.courseCode + '</div>' +
            '<div class="g-name">' + e.courseName + '</div>' +
            '<div class="g-meta">' + (e.instructor ? e.instructor + ' · ' : '') + e.credits + ' Credits</div>' +
            '</div><div class="grade-right">' +
            '<div class="grade-circle" style="' + cs + '">' + (e.grade || '?') + '</div>' +
            '<select class="grade-sel" onchange="setGrade(' + e.enrollmentId + ',this.value)">' +
            '<option value="">Set Grade</option>' +
            ['S','A','B','C','D','E','F'].map(function(gg) {
                return '<option value="' + gg + '"' + (e.grade === gg ? ' selected' : '') + '>' + gg + '</option>';
            }).join('') +
            '</select></div></div>';
    }).join('');
    cont.innerHTML = html;
}

async function setGrade(eid, grade) {
    if (!grade) return;
    var r = await api('/enrollments/' + eid + '/grade', 'PUT', { grade: grade });
    if (r.ok) { toast('Grade ' + grade + ' saved!'); await loadGrades(); }
    else toast('Failed.', 'error');
}

// ── REPORT ────────────────────────────────────────────
async function genReport() {
    var btn = document.getElementById('btnReport');
    setBusy(btn, true, 'Generating...');
    var res  = await Promise.all([api('/courses'), api('/enrollments/stats'), api('/students')]);
    var cs   = res[0].data || [];
    var stat = res[1].data || {};
    var ss   = res[2].data || [];

    var r = '';
    r += '╔══════════════════════════════════════════════════════════════╗\n';
    r += '║         COURSE MANAGEMENT SYSTEM — FULL REPORT              ║\n';
    r += '╚══════════════════════════════════════════════════════════════╝\n\n';
    r += '  Generated   : ' + new Date().toLocaleString() + '\n\n';
    r += '━━━━ SUMMARY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    r += '  Total Courses     : ' + (stat.totalCourses||0) + '\n';
    r += '  Total Students    : ' + (stat.totalStudents||0) + '\n';
    r += '  Total Enrollments : ' + (stat.totalEnrollments||0) + '\n';
    r += '  Open Courses      : ' + (stat.availableCourses||0) + '\n\n';
    if (cs.length) {
        r += '━━━━ COURSES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
        for (var i = 0; i < cs.length; i++) {
            var c = cs[i];
            r += '  ▦  [' + c.courseCode + '] ' + c.courseName + '\n';
            r += '     Instructor : ' + (c.instructor||'N/A') + '\n';
            r += '     Category   : ' + (c.category||'N/A') + '\n';
            r += '     Credits    : ' + c.credits + '\n';
            r += '     Seats      : ' + c.enrolledCount + '/' + c.maxStrength + ' — ' + (c.available?'OPEN':'FULL') + '\n';
            var er = await api('/enrollments/course/' + c.id);
            var en = er.data || [];
            if (en.length) {
                r += '     Students   :\n';
                en.forEach(function(e) {
                    r += '       → ' + (e.rollNo+'              ').slice(0,14) + ' ' + (e.studentName+'                    ').slice(0,20) + ' Grade: ' + (e.grade||'Pending') + '\n';
                });
            } else { r += '     Students   : None\n'; }
            r += '\n';
        }
    }
    if (ss.length) {
        r += '━━━━ STUDENTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
        ss.forEach(function(st) {
            r += '  ◎  ' + (st.rollNo+'              ').slice(0,14) + ' ' + (st.name+'                    ').slice(0,20) + ' ' + (st.department||'N/A') + ' Sem:' + (st.semester||'—') + ' Courses:' + st.enrolledCoursesCount + '\n';
        });
        r += '\n';
    }
    r += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n  END OF REPORT\n';
    document.getElementById('reportBox').textContent = r;
    window._report = r;
    setBusy(btn, false, 'Generate Report');
    toast('Report generated!');
}

function dlReport() {
    if (!window._report) { toast('Generate report first.','error'); return; }
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([window._report], {type:'text/plain'}));
    a.download = 'cms-report-' + new Date().toISOString().slice(0,10) + '.txt';
    a.click();
    toast('Downloaded!');
}

// ── GLOBAL SEARCH ─────────────────────────────────────
document.getElementById('globalSearch').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && this.value.trim()) {
        var q = this.value.trim();
        go('courses');
        setTimeout(function() {
            document.getElementById('courseSearch').value = q;
            document.getElementById('courseSearch').dispatchEvent(new Event('input'));
        }, 150);
        this.value = '';
    }
});
