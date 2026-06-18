  import { useState, useEffect } from "react";

function App() {

  // ===== AUTH STATES =====
  const [authCredentials, setAuthCredentials] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"

  // ===== REGISTRATION STATES =====
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");

  // ===== NAVIGATION =====
  const [page, setPage] = useState("student");
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });
  const [currentTeacher, setCurrentTeacher] = useState(null);

  // ===== SEARCH STATES =====
  const [studentSearch, setStudentSearch] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [assignmentSearch, setAssignmentSearch] = useState("");
  const [enrolledStudentSearch, setEnrolledStudentSearch] = useState("");

  // ===== DATA =====
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  // ===== FORM STATES =====
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [studentId, setStudentId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [courseAssignmentId, setCourseAssignmentId] = useState("");

  // ===== NOTIFICATION =====
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 3000);
  };

  // ===== AUTH HELPER =====
  const authFetch = (url, options = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...(authCredentials && {
        "Authorization": "Basic " + btoa(`${authCredentials.email}:${authCredentials.password}`)
      }),
      ...options.headers,
    };
    return fetch(url, { ...options, headers }).then(res => {
      if (res.status === 401) {
        setIsAuthenticated(false);
        setAuthCredentials(null);
        showNotification("⚠️ Session expired. Please login again.", "error");
      }
      return res;
    });
  };

  // ===== LOGIN =====
  const handleLogin = async () => {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      showNotification("❌ Please enter email and password!", "error");
      return;
    }
    setLoginLoading(true);
    try {
      // Uses /students as the auth-check endpoint — change if needed
  const res = await fetch("http://localhost:8082/login", {
   method: "POST",
   headers: {
    "Content-Type": "application/json"
   },
   body: JSON.stringify({
    email: loginEmail,
    password: loginPassword
   })
});
  if(res.ok) {
      setAuthCredentials({ email: loginEmail, password: loginPassword });
      setIsAuthenticated(true);
      showNotification("✅ Logged in successfully!");
    } else if (res.status === 401 || res.status === 403) {
        showNotification("❌ Invalid email or password!", "error");
    } else {
        showNotification("❌ Login failed. Try again.", "error");
     }
   } catch (err) {
      console.error("Login error:", err);
      showNotification("❌ Could not connect to server!", "error");
   } finally {
      setLoginLoading(false);
   }
  };

  // ===== REGISTER USER =====
  // ⚠️ Replace the URL below with your actual UserController @PostMapping path
  const registerUser = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() ||
        !userName.trim() || !password.trim() || !confirmPassword.trim() || !role) {
      showNotification("❌ Please fill in all fields!", "error");
      return;
    }
    if (password !== confirmPassword) {
      showNotification("❌ Passwords do not match!", "error");
      return;
    }
    if (password.length < 6) {
      showNotification("❌ Password must be at least 6 characters!", "error");
      return;
    }
    const data = {
  firstName: firstName,
  lastName: lastName,
  email: email,
  userName: userName,
  password: password,
  confirmPassword: confirmPassword,
  role: role
};

console.log(data);

    
    try {
      const res = await fetch("http://localhost:8082/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        showNotification("✅ Account created! Please sign in.");
        setFirstName(""); setLastName(""); setEmail("");
        setUserName(""); setPassword(""); setConfirmPassword(""); setRole("");
        setAuthMode("login");
      } else {
        const data = await res.text();
        showNotification("❌ Registration failed: " + data, "error");
      }
    } catch (err) {
      console.error("Registration error:", err);
      showNotification("❌ Could not connect to server!", "error");
    }
  };

  const handleLogoutApp = () => {
    setIsAuthenticated(false);
    setAuthCredentials(null);
    setCurrentTeacher(null);
    setLoginEmail("");
    setLoginPassword("");
    showNotification("👋 Logged out successfully!");
  };
   
  // ===== FETCH ALL DATA =====
  const fetchAll = () => {
    authFetch("http://localhost:8082/students").then(res => res.json()).then(setStudents).catch(console.error);
    authFetch("http://localhost:8082/teachers").then(res => res.json()).then(setTeachers).catch(console.error);
    authFetch("http://localhost:8082/courses").then(res => res.json()).then(setCourses).catch(console.error);
    authFetch("http://localhost:8082/assignments").then(res => res.json()).then(setAssignments).catch(console.error);
    authFetch("http://localhost:8082/enrollments").then(res => res.json()).then(setEnrollments).catch(console.error);
  };

  useEffect(() => {
    if (isAuthenticated) fetchAll();
  }, [isAuthenticated]);

  // ===== HELPERS =====
  const getEnrolledStudents = () => {
    if (!currentTeacher) return [];
    const teacherAssignments = assignments.filter(a => a.teacherId === currentTeacher.id);
    const teacherEnrollments = enrollments.filter(e => teacherAssignments.some(a => a.id === e.courseAssignmentId));
    return students.filter(s => teacherEnrollments.some(e => e.studentId === s.id));
  };

  const unenrollStudent = (sid) => {
    const enrollment = enrollments.find(e => e.studentId === sid);
    if (enrollment) {
      authFetch(`http://localhost:8082/enrolls/${enrollment.id}`, { method: "DELETE" })
        .then(res => { if (res.ok) { showNotification("✅ Student unenrolled!"); fetchAll(); } })
        .catch(() => showNotification("❌ Error unenrolling!", "error"));
    }
  };

  // ===== FILTERING =====
  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.email?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.id?.toString().includes(studentSearch)
  );
  const filteredTeachers = teachers.filter(t =>
    t.name?.toLowerCase().includes(teacherSearch.toLowerCase()) ||
    t.email?.toLowerCase().includes(teacherSearch.toLowerCase()) ||
    t.id?.toString().includes(teacherSearch)
  );
  const filteredCourses = courses.filter(c =>
    c.name?.toLowerCase().includes(courseSearch.toLowerCase()) ||
    c.description?.toLowerCase().includes(courseSearch.toLowerCase()) ||
    c.id?.toString().includes(courseSearch)
  );
  const filteredAssignments = assignments.filter(a =>
    a.courseName?.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
    a.teacherName?.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
    a.id?.toString().includes(assignmentSearch)
  );
  const filteredEnrolledStudents = enrollments.filter(e => {
    const student = students.find(s => s.id === e.studentId);
    const assignment = assignments.find(a => a.id === e.assignmentId);
    return (
      student?.name?.toLowerCase().includes(enrolledStudentSearch.toLowerCase()) ||
      assignment?.courseName?.toLowerCase().includes(enrolledStudentSearch.toLowerCase())
    );
  });

  // ===== CRUD =====
  const createStudent = () => {
    if (!studentName.trim() || !studentEmail.trim()) { showNotification("❌ Fill all fields!", "error"); return; }
    authFetch("http://localhost:8082/students", { method: "POST", body: JSON.stringify({ name: studentName, email: studentEmail }) })
      .then(res => { if (res.ok) { setStudentName(""); setStudentEmail(""); showNotification(`✅ Student "${studentName}" registered!`); fetchAll(); } })
      .catch(() => showNotification("❌ Error!", "error"));
  };
  const createCourse = () => {
    if (!courseName.trim() || !courseDescription.trim()) { showNotification("❌ Fill all fields!", "error"); return; }
    authFetch("http://localhost:8082/courses", { method: "POST", body: JSON.stringify({ name: courseName, description: courseDescription }) })
      .then(res => { if (res.ok) { setCourseName(""); setCourseDescription(""); showNotification(`✅ Course "${courseName}" created!`); fetchAll(); } })
      .catch(() => showNotification("❌ Error!", "error"));
  };
  const assignTeacher = () => {
    if (!teacherId || !courseId) { showNotification("❌ Select teacher and course!", "error"); return; }
    authFetch("http://localhost:8082/assigns", { method: "POST", body: JSON.stringify({ teacherId: Number(teacherId), courseId: Number(courseId) }) })
      .then(res => { if (res.ok) { showNotification("✅ Teacher assigned!"); setTeacherId(""); setCourseId(""); fetchAll(); } else showNotification("❌ Assignment failed!", "error"); })
      .catch(() => showNotification("❌ Error!", "error"));
  };
  const enrollStudent = () => {
    if (!studentId || !courseAssignmentId) { showNotification("❌ Select student and course!", "error"); return; }
    authFetch("http://localhost:8082/enrolls", { method: "POST", body: JSON.stringify({ studentId: Number(studentId), assignmentId: Number(courseAssignmentId) }) })
      .then(res => { if (res.ok) { showNotification("✅ Student enrolled!"); fetchAll(); } else showNotification("❌ Enrollment failed!", "error"); })
      .catch(() => showNotification("❌ Error!", "error"));
  };
  const deleteStudent = (id) => { if (!window.confirm("Delete student?")) return; authFetch(`http://localhost:8082/student/id/${id}`, { method: "DELETE" }).then(res => { if (res.ok) { showNotification("✅ Deleted!"); fetchAll(); } }); };
  const deleteTeacher = (id) => { if (!window.confirm("Delete teacher?")) return; authFetch(`http://localhost:8082/teachers/${id}`, { method: "DELETE" }).then(res => { if (res.ok) { showNotification("✅ Deleted!"); fetchAll(); } }); };
  const deleteCourse = (id) => { if (!window.confirm("Delete course?")) return; authFetch(`http://localhost:8082/course/${id}`, { method: "DELETE" }).then(res => { if (res.ok) { showNotification("✅ Deleted!"); fetchAll(); } }); };
  const deleteAssignment = (id) => { if (!window.confirm("Delete assignment?")) return; authFetch(`http://localhost:8082/assign/id/${id}`, { method: "DELETE" }).then(res => { if (res.ok) { showNotification("✅ Deleted!"); fetchAll(); } }); };
  const deleteEnrolledCourse = (id) => { if (!window.confirm("Delete enrollment?")) return; authFetch(`http://localhost:8082/enroll/id/${id}`, { method: "DELETE" }).then(res => { if (res.ok) { showNotification("✅ Deleted!"); fetchAll(); } }); };
  const updateStudent = (id, name, email) => { const n = prompt("New name:", name); const e = prompt("New email:", email); if (n && e) authFetch(`http://localhost:8082/student/update/${id}`, { method: "PUT", body: JSON.stringify({ name: n, email: e }) }).then(res => { if (res.ok) { showNotification("✅ Updated!"); fetchAll(); } }); };
  const updateTeacher = (id, name, email) => { const n = prompt("New name:", name); const e = prompt("New email:", email); if (n && e) authFetch(`http://localhost:8082/teacher/id/${id}`, { method: "PUT", body: JSON.stringify({ name: n, email: e }) }).then(res => { if (res.ok) { showNotification("✅ Updated!"); fetchAll(); } }); };
  const updateCourse = (id, name, desc) => { const n = prompt("New name:", name); const d = prompt("New description:", desc); if (n && d) authFetch(`http://localhost:8082/course/${id}`, { method: "PUT", body: JSON.stringify({ name: n, description: d }) }).then(res => { if (res.ok) { showNotification("✅ Updated!"); fetchAll(); } }); };

  // ===== SHARED STYLES =====
  const inp = { padding: "11px 14px", borderRadius: "6px", border: "1.5px solid #dde1e7", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "inherit", backgroundColor: "#fff" };
  const lbl = { display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "#374151" };
  const btn = (bg) => ({ padding: "5px 10px", backgroundColor: bg, color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" });
  const tableHead = (bg) => ({ backgroundColor: bg, color: "white" });
  const tableRow = (idx) => ({ borderBottom: "1px solid #f1f5f9", backgroundColor: idx % 2 === 0 ? "#f8fafc" : "white" });

  // ============================================================
  // AUTH SCREEN
  // ============================================================
  if (!isAuthenticated) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f0f4f8", fontFamily: "'Segoe UI', Arial, sans-serif" }}>

        {notification.show && (
          <div style={{ position: "fixed", top: "20px", right: "20px", padding: "14px 20px", backgroundColor: notification.type === "success" ? "#16a34a" : "#dc2626", color: "white", borderRadius: "8px", boxShadow: "0 4px 16px rgba(0,0,0,0.18)", zIndex: 1000, fontWeight: "bold", fontSize: "14px" }}>
            {notification.message}
          </div>
        )}

        <div style={{ backgroundColor: "white", borderRadius: "14px", boxShadow: "0 8px 40px rgba(0,0,0,0.10)", width: "100%", maxWidth: authMode === "register" ? "520px" : "420px", overflow: "hidden" }}>

          {/* Header */}
          <div style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)", padding: "32px 40px 28px", textAlign: "center", color: "white" }}>
            <div style={{ fontSize: "44px", marginBottom: "8px" }}>📚</div>
            <h2 style={{ margin: "0 0 4px 0", fontSize: "22px", fontWeight: "700" }}>School Management</h2>
            <p style={{ margin: 0, fontSize: "13px", opacity: 0.85 }}>{authMode === "login" ? "Sign in to your account" : "Create a new account"}</p>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "2px solid #f1f5f9" }}>
            {[["login", "🔑 Sign In"], ["register", "📝 Register"]].map(([mode, label]) => (
              <button key={mode} onClick={() => setAuthMode(mode)} style={{ flex: 1, padding: "14px", border: "none", cursor: "pointer", backgroundColor: authMode === mode ? "#eff6ff" : "white", color: authMode === mode ? "#1d4ed8" : "#6b7280", fontWeight: authMode === mode ? "700" : "500", fontSize: "14px", borderBottom: authMode === mode ? "2px solid #1d4ed8" : "none" }}>
                {label}
              </button>
            ))}
          </div>

          <div style={{ padding: "30px 40px 36px" }}>

            {/* LOGIN */}
            {authMode === "login" && (
              <div style={{ display: "grid", gap: "18px" }}>
                <div>
                  <label style={lbl}>Email</label>
                  <input value={loginEmail} onChange={e => setLoginEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="Enter your email" style={inp} />
                </div>
                <div>
                  <label style={lbl}>Password</label>
                  <input value={loginPassword} onChange={e => setLoginPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="Enter your password" type="password" style={inp} />
                </div>
                <button onClick={handleLogin} disabled={loginLoading} style={{ padding: "13px", backgroundColor: loginLoading ? "#93c5fd" : "#1d4ed8", color: "white", border: "none", borderRadius: "7px", cursor: loginLoading ? "not-allowed" : "pointer", fontWeight: "700", fontSize: "15px" }}>
                  {loginLoading ? "Signing in..." : "Sign In"}
                </button>
                <p style={{ textAlign: "center", margin: 0, fontSize: "13px", color: "#9ca3af" }}>
                  Don't have an account?{" "}
                  <span onClick={() => setAuthMode("register")} style={{ color: "#1d4ed8", cursor: "pointer", fontWeight: "600" }}>Register here</span>
                </p>
              </div>
            )}

            {/* REGISTER */}
            {authMode === "register" && (
              <div style={{ display: "grid", gap: "16px" }}>

                {/* First + Last Name */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={lbl}>First Name</label>
                    <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John" style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Last Name</label>
                    <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" style={inp} />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label style={lbl}>Email Address</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} placeholder="john.doe@email.com" type="email" style={inp} />
                </div>

                {/* Username */}
                <div>
                  <label style={lbl}>Username</label>
                  <input value={userName} onChange={e => setUserName(e.target.value)} placeholder="Choose a username" style={inp} />
                </div>

                {/* Role */}
                <div>
                  <label style={lbl}>Role</label>
                  <select value={role} onChange={e => setRole(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                    <option value="">Select a role...</option>
                    <option value="STUDENT">🎓 Student</option>
                    <option value="TEACHER">👨‍🏫 Teacher</option>
                    <option value="ADMIN">⚙️ Admin</option>
                  </select>
                </div>

                {/* Password + Confirm */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={lbl}>Password</label>
                    <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 chars" type="password" style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Confirm Password</label>
                    <input
                      value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password" type="password"
                      style={{ ...inp, borderColor: confirmPassword && confirmPassword !== password ? "#ef4444" : "#dde1e7" }}
                    />
                    {confirmPassword && confirmPassword !== password && (
                      <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#ef4444" }}>Passwords do not match</p>
                    )}
                    {confirmPassword && confirmPassword === password && (
                      <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#16a34a" }}>✓ Passwords match</p>
                    )}
                  </div>
                </div>

                <button onClick={registerUser} style={{ padding: "13px", backgroundColor: "#1d4ed8", color: "white", border: "none", borderRadius: "7px", cursor: "pointer", fontWeight: "700", fontSize: "15px", marginTop: "4px" }}>
                  Create Account
                </button>
                <p style={{ textAlign: "center", margin: 0, fontSize: "13px", color: "#9ca3af" }}>
                  Already have an account?{" "}
                  <span onClick={() => setAuthMode("login")} style={{ color: "#1d4ed8", cursor: "pointer", fontWeight: "600" }}>Sign in here</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN APP
  // ============================================================
  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", minHeight: "100vh", backgroundColor: "#f8fafc" }}>

      {notification.show && (
        <div style={{ position: "fixed", top: "20px", right: "20px", padding: "14px 20px", backgroundColor: notification.type === "success" ? "#16a34a" : "#dc2626", color: "white", borderRadius: "8px", boxShadow: "0 4px 16px rgba(0,0,0,0.18)", zIndex: 1000, fontWeight: "bold", fontSize: "14px" }}>
          {notification.message}
        </div>
      )}

      {/* HEADER */}
      <div style={{ backgroundColor: "#1e293b", padding: "16px 30px", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
        <div>
          <h1 style={{ margin: "0 0 2px 0", fontSize: "20px", fontWeight: "700" }}>📚 School Management System</h1>
          <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>Manage Students, Teachers, Courses & Assignments</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span style={{ fontSize: "13px", color: "#94a3b8" }}>🔐 <strong style={{ color: "white" }}>{authCredentials?.username}</strong></span>
          <button onClick={handleLogoutApp} style={{ padding: "7px 16px", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>Sign Out</button>
        </div>
      </div>

      {/* NAV */}
      <div style={{ display: "flex", gap: "8px", padding: "14px 30px", backgroundColor: "#f1f5f9", borderBottom: "1px solid #e2e8f0" }}>
        {[["student", "👤 Student Dashboard", "#2563eb"], ["teacher", "🏫 Teacher Dashboard", "#16a34a"], ["admin", "⚙️ Admin Dashboard", "#dc2626"]].map(([id, label, color]) => (
          <button key={id} onClick={() => setPage(id)} style={{ padding: "9px 20px", backgroundColor: page === id ? color : "#94a3b8", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>
            {label}
          </button>
        ))}
      </div>

      {/* ===== STUDENT DASHBOARD ===== */}
      {page === "student" && (
        <div style={{ padding: "30px" }}>
          <h2 style={{ color: "#1e293b", borderBottom: "3px solid #2563eb", paddingBottom: "10px" }}>👤 Student Dashboard</h2>
          <div style={{ backgroundColor: "#eff6ff", padding: "24px", borderRadius: "10px", marginBottom: "24px", border: "2px solid #2563eb" }}>
            <h3 style={{ marginTop: 0, color: "#1e293b" }}>Register New Student</h3>
            <div style={{ display: "grid", gap: "12px", marginBottom: "14px" }}>
              <input value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Full Name" style={inp} />
              <input value={studentEmail} onChange={e => setStudentEmail(e.target.value)} placeholder="Email Address" type="email" style={inp} />
            </div>
            <button onClick={createStudent} style={{ padding: "10px 26px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>Register Student</button>
          </div>
        </div>
      )}

      {/* ===== TEACHER DASHBOARD ===== */}
      {page === "teacher" && (
        <div style={{ padding: "30px" }}>
          <h2 style={{ color: "#1e293b", borderBottom: "3px solid #16a34a", paddingBottom: "10px" }}>
            🏫 Teacher Dashboard
            {currentTeacher && (
              <span style={{ float: "right", fontSize: "14px", color: "#64748b" }}>
                Welcome, {currentTeacher.name}
                <button onClick={() => { setCurrentTeacher(null); showNotification("👋 Logged out!"); }} style={{ marginLeft: "10px", ...btn("#ef4444") }}>Logout</button>
              </span>
            )}
          </h2>

          {!currentTeacher ? (
            <div style={{ maxWidth: "560px", margin: "0 auto" }}>
              <div style={{ backgroundColor: "#f0fdf4", padding: "30px", borderRadius: "10px", border: "2px solid #16a34a" }}>
                <h3 style={{ marginTop: 0, color: "#1e293b" }}>👨‍🏫 Teacher Login / Register</h3>
                <div style={{ display: "grid", gap: "14px", marginBottom: "20px" }}>
                  <input value={teacherName} onChange={e => setTeacherName(e.target.value)} placeholder="Full Name" style={inp} />
                  <input value={teacherEmail} onChange={e => setTeacherEmail(e.target.value)} placeholder="Email Address" type="email" style={inp} />
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => {
                    if (!teacherName || !teacherEmail) { showNotification("❌ Fill all fields!", "error"); return; }
                    authFetch("http://localhost:8082/teachers", { method: "POST", body: JSON.stringify({ name: teacherName, email: teacherEmail }) })
                      .then(res => res.json()).then(t => { setCurrentTeacher(t); showNotification("✅ Registered!"); setTeacherName(""); setTeacherEmail(""); fetchAll(); });
                  }} style={{ flex: 1, padding: "12px", backgroundColor: "#16a34a", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "15px" }}>Register</button>
                  <button onClick={() => {
                    const t = teachers.find(t => t.email === teacherEmail);
                    if (t) { setCurrentTeacher(t); showNotification("✅ Logged in!"); setTeacherEmail(""); }
                    else showNotification("❌ Teacher not found!", "error");
                  }} style={{ flex: 1, padding: "12px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "15px" }}>Login</button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Students in My Courses */}
              <div style={{ backgroundColor: "white", padding: "22px", borderRadius: "10px", border: "2px solid #16a34a", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <h3 style={{ marginTop: 0, color: "#1e293b" }}>👥 Students in My Courses ({getEnrolledStudents().length})</h3>
                <input type="text" placeholder="🔍 Search students..." value={studentSearch} onChange={e => setStudentSearch(e.target.value)} style={{ ...inp, marginBottom: "14px", border: "2px solid #16a34a" }} />
                {getEnrolledStudents().length > 0 ? (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr style={tableHead("#16a34a")}><th style={{ padding: "10px", textAlign: "left" }}>ID</th><th style={{ padding: "10px", textAlign: "left" }}>Name</th><th style={{ padding: "10px", textAlign: "left" }}>Email</th><th style={{ padding: "10px", textAlign: "center" }}>Actions</th></tr></thead>
                    <tbody>
                      {getEnrolledStudents().filter(s => s.name?.toLowerCase().includes(studentSearch.toLowerCase()) || s.email?.toLowerCase().includes(studentSearch.toLowerCase())).map((s, idx) => (
                        <tr key={s.id} style={tableRow(idx)}>
                          <td style={{ padding: "10px" }}>{idx + 1}</td><td style={{ padding: "10px" }}>{s.name}</td><td style={{ padding: "10px" }}>{s.email}</td>
                          <td style={{ padding: "10px", textAlign: "center" }}>
                            <button onClick={() => updateStudent(s.id, s.name, s.email)} style={{ ...btn("#f59e0b"), marginRight: "5px" }}>✏️ Edit</button>
                            <button onClick={() => unenrollStudent(s.id)} style={btn("#ef4444")}>🚫 Unenroll</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p style={{ color: "#94a3b8" }}>No students enrolled yet.</p>}
              </div>

              {/* My Courses */}
              <div style={{ backgroundColor: "white", padding: "22px", borderRadius: "10px", marginTop: "24px", border: "2px solid #16a34a", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <h3 style={{ marginTop: 0, color: "#1e293b" }}>📚 My Assigned Courses ({assignments.filter(a => a.teacherId === currentTeacher.id).length})</h3>
                <input type="text" placeholder="🔍 Search courses..." value={assignmentSearch} onChange={e => setAssignmentSearch(e.target.value)} style={{ ...inp, marginBottom: "14px", border: "2px solid #16a34a" }} />
                {assignments.filter(a => a.teacherId === currentTeacher.id).length > 0 ? (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr style={tableHead("#16a34a")}><th style={{ padding: "10px", textAlign: "left" }}>ID</th><th style={{ padding: "10px", textAlign: "left" }}>Course</th><th style={{ padding: "10px", textAlign: "left" }}>Description</th><th style={{ padding: "10px", textAlign: "center" }}>Actions</th></tr></thead>
                    <tbody>
                      {assignments.filter(a => a.teacherId === currentTeacher.id && (a.courseName?.toLowerCase().includes(assignmentSearch.toLowerCase()) || a.id?.toString().includes(assignmentSearch))).map((a, idx) => {
                        const course = courses.find(c => c.id === a.courseId);
                        return (
                          <tr key={a.id} style={tableRow(idx)}>
                            <td style={{ padding: "10px" }}>{idx + 1}</td><td style={{ padding: "10px" }}>{a.courseName}</td><td style={{ padding: "10px" }}>{course?.description || "No description"}</td>
                            <td style={{ padding: "10px", textAlign: "center" }}><button onClick={() => course && updateCourse(course.id, course.name, course.description)} disabled={!course} style={btn("#f59e0b")}>✏️ Edit Course</button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : <p style={{ color: "#94a3b8" }}>No courses assigned yet.</p>}
              </div>
            </>
          )}
        </div>
      )}

      {/* ===== ADMIN DASHBOARD ===== */}
      {page === "admin" && (
        <div style={{ padding: "30px" }}>
          <h2 style={{ color: "#1e293b", borderBottom: "3px solid #dc2626", paddingBottom: "10px" }}>⚙️ Admin Dashboard</h2>

          {/* Create Course */}
          <div style={{ backgroundColor: "#fef2f2", padding: "22px", borderRadius: "10px", marginBottom: "24px", border: "2px solid #dc2626" }}>
            <h3 style={{ marginTop: 0, color: "#1e293b" }}>➕ Create New Course</h3>
            <div style={{ display: "grid", gap: "12px", marginBottom: "14px" }}>
              <input value={courseName} onChange={e => setCourseName(e.target.value)} placeholder="Course Name" style={inp} />
              <textarea value={courseDescription} onChange={e => setCourseDescription(e.target.value)} placeholder="Course Description" rows="3" style={{ ...inp, resize: "vertical" }} />
            </div>
            <button onClick={createCourse} style={{ padding: "10px 26px", backgroundColor: "#dc2626", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>Create Course</button>
          </div>

          {/* All Courses */}
          <div style={{ backgroundColor: "white", padding: "22px", borderRadius: "10px", marginBottom: "24px", border: "2px solid #dc2626", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h3 style={{ marginTop: 0, color: "#1e293b" }}>📚 All Courses ({filteredCourses.length})</h3>
            <input type="text" placeholder="🔍 Search courses..." value={courseSearch} onChange={e => setCourseSearch(e.target.value)} style={{ ...inp, marginBottom: "14px", border: "2px solid #dc2626" }} />
            {filteredCourses.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={tableHead("#dc2626")}><th style={{ padding: "10px", textAlign: "left" }}>ID</th><th style={{ padding: "10px", textAlign: "left" }}>Course Name</th><th style={{ padding: "10px", textAlign: "left" }}>Description</th><th style={{ padding: "10px", textAlign: "center" }}>Actions</th></tr></thead>
                <tbody>
                  {filteredCourses.map((c, idx) => (
                    <tr key={c.courseId} style={tableRow(idx)}>
                      <td style={{ padding: "10px" }}>{idx + 1}</td><td style={{ padding: "10px" }}>{c.name}</td><td style={{ padding: "10px" }}>{c.description}</td>
                      <td style={{ padding: "10px", textAlign: "center" }}>
                        <button onClick={() => updateCourse(c.courseId, c.name, c.description)} style={{ ...btn("#f59e0b"), marginRight: "5px" }}>✏️ Edit</button>
                        <button onClick={() => deleteCourse(c.courseId)} style={btn("#ef4444")}>🗑️ Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p style={{ color: "#94a3b8" }}>No courses yet.</p>}
          </div>

          {/* All Students */}
          <div style={{ backgroundColor: "white", padding: "22px", borderRadius: "10px", marginBottom: "24px", border: "2px solid #2563eb", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h3 style={{ marginTop: 0, color: "#1e293b" }}>👤 All Students ({filteredStudents.length})</h3>
            <input type="text" placeholder="🔍 Search students..." value={studentSearch} onChange={e => setStudentSearch(e.target.value)} style={{ ...inp, marginBottom: "14px", border: "2px solid #2563eb" }} />
            {filteredStudents.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={tableHead("#2563eb")}><th style={{ padding: "10px", textAlign: "left" }}>ID</th><th style={{ padding: "10px", textAlign: "left" }}>Name</th><th style={{ padding: "10px", textAlign: "left" }}>Email</th><th style={{ padding: "10px", textAlign: "center" }}>Actions</th></tr></thead>
                <tbody>
                  {filteredStudents.map((s, idx) => (
                    <tr key={s.studentId} style={tableRow(idx)}>
                      <td style={{ padding: "10px" }}>{idx + 1}</td><td style={{ padding: "10px" }}>{s.name}</td><td style={{ padding: "10px" }}>{s.email}</td>
                      <td style={{ padding: "10px", textAlign: "center" }}>
                        <button onClick={() => updateStudent(s.studentId, s.name, s.email)} style={{ ...btn("#f59e0b"), marginRight: "5px" }}>✏️ Edit</button>
                        <button onClick={() => deleteStudent(s.studentId)} style={btn("#ef4444")}>🗑️ Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p style={{ color: "#94a3b8" }}>No students yet.</p>}
          </div>

          {/* All Teachers */}
          <div style={{ backgroundColor: "white", padding: "22px", borderRadius: "10px", marginBottom: "24px", border: "2px solid #16a34a", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h3 style={{ marginTop: 0, color: "#1e293b" }}>👥 All Teachers ({filteredTeachers.length})</h3>
            <input type="text" placeholder="🔍 Search teachers..." value={teacherSearch} onChange={e => setTeacherSearch(e.target.value)} style={{ ...inp, marginBottom: "14px", border: "2px solid #16a34a" }} />
            {filteredTeachers.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={tableHead("#16a34a")}><th style={{ padding: "10px", textAlign: "left" }}>ID</th><th style={{ padding: "10px", textAlign: "left" }}>Name</th><th style={{ padding: "10px", textAlign: "left" }}>Email</th><th style={{ padding: "10px", textAlign: "center" }}>Actions</th></tr></thead>
                <tbody>
                  {filteredTeachers.map((t, idx) => (
                    <tr key={t.teacherId} style={tableRow(idx)}>
                      <td style={{ padding: "10px" }}>{idx + 1}</td><td style={{ padding: "10px" }}>{t.name}</td><td style={{ padding: "10px" }}>{t.email}</td>
                      <td style={{ padding: "10px", textAlign: "center" }}>
                        <button onClick={() => updateTeacher(t.teacherId, t.name, t.email)} style={{ ...btn("#f59e0b"), marginRight: "5px" }}>✏️ Edit</button>
                        <button onClick={() => deleteTeacher(t.teacherId)} style={btn("#ef4444")}>🗑️ Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p style={{ color: "#94a3b8" }}>No teachers yet.</p>}
          </div>

          {/* Assign Teacher */}
          <div style={{ backgroundColor: "#fffbeb", padding: "22px", borderRadius: "10px", marginBottom: "24px", border: "2px solid #f59e0b" }}>
            <h3 style={{ marginTop: 0, color: "#1e293b" }}>🎓 Assign Teacher to Course</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
              <select value={teacherId} onChange={e => setTeacherId(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                <option value="">Select Teacher</option>
                {teachers.map(t => { const id = String(t.id ?? t.teacherId ?? ""); return <option key={id} value={id}>{t.name}</option>; })}
              </select>
              <select value={courseId} onChange={e => setCourseId(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                <option value="">Select Course</option>
                {courses.map(c => { const id = String(c.id ?? c.courseId ?? ""); return <option key={id} value={id}>{c.name}</option>; })}
              </select>
            </div>
            <button onClick={assignTeacher} style={{ padding: "10px 26px", backgroundColor: "#f59e0b", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>Assign Teacher</button>
          </div>

          {/* Assignments */}
          <div style={{ backgroundColor: "white", padding: "22px", borderRadius: "10px", marginBottom: "24px", border: "2px solid #f59e0b", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h3 style={{ marginTop: 0, color: "#1e293b" }}>✅ Assignments ({filteredAssignments.length})</h3>
            <input type="text" placeholder="🔍 Search assignments..." value={assignmentSearch} onChange={e => setAssignmentSearch(e.target.value)} style={{ ...inp, marginBottom: "14px", border: "2px solid #f59e0b" }} />
            {filteredAssignments.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={tableHead("#f59e0b")}><th style={{ padding: "10px", textAlign: "left" }}>ID</th><th style={{ padding: "10px", textAlign: "left" }}>Course</th><th style={{ padding: "10px", textAlign: "left" }}>Teacher</th><th style={{ padding: "10px", textAlign: "center" }}>Actions</th></tr></thead>
                <tbody>
                  {filteredAssignments.map((a, idx) => (
                    <tr key={a.assignmentId} style={tableRow(idx)}>
                      <td style={{ padding: "10px" }}>{idx + 1}</td><td style={{ padding: "10px" }}>{a.courseName}</td><td style={{ padding: "10px" }}>{a.teacherName}</td>
                      <td style={{ padding: "10px", textAlign: "center" }}><button onClick={() => deleteAssignment(a.assignmentId)} style={btn("#ef4444")}>🗑️ Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p style={{ color: "#94a3b8" }}>No assignments yet.</p>}
          </div>

          {/* Enroll Student */}
          <div style={{ backgroundColor: "#faf5ff", padding: "22px", borderRadius: "10px", marginBottom: "24px", border: "2px solid #9333ea" }}>
            <h3 style={{ marginTop: 0, color: "#1e293b" }}>🎯 Enroll Student</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
              <select value={studentId} onChange={e => setStudentId(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                <option value="">Select Student</option>
                {students.map(s => { const id = String(s.id ?? s.studentId ?? ""); return <option key={id} value={id}>{s.name}</option>; })}
              </select>
              <select value={courseAssignmentId} onChange={e => setCourseAssignmentId(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                <option value="">Select Course + Teacher</option>
                {assignments.map(a => { const id = String(a.id ?? a.assignmentId ?? ""); return <option key={id} value={id}>{a.courseName} → {a.teacherName}</option>; })}
              </select>
            </div>
            <button onClick={enrollStudent} style={{ padding: "10px 26px", backgroundColor: "#9333ea", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>Enroll Student</button>
          </div>

          {/* Enrolled Students */}
          <div style={{ backgroundColor: "white", padding: "22px", borderRadius: "10px", marginBottom: "24px", border: "2px solid #9333ea", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h3 style={{ marginTop: 0, color: "#1e293b" }}>📋 Enrolled Students ({filteredEnrolledStudents.length})</h3>
            <input type="text" placeholder="🔍 Search by student or course..." value={enrolledStudentSearch} onChange={e => setEnrolledStudentSearch(e.target.value)} style={{ ...inp, marginBottom: "14px", border: "2px solid #9333ea" }} />
            {filteredEnrolledStudents.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={tableHead("#9333ea")}><th style={{ padding: "10px", textAlign: "left" }}>ID</th><th style={{ padding: "10px", textAlign: "left" }}>Student</th><th style={{ padding: "10px", textAlign: "left" }}>Teacher</th><th style={{ padding: "10px", textAlign: "left" }}>Course</th><th style={{ padding: "10px", textAlign: "center" }}>Action</th></tr></thead>
                <tbody>
                  {filteredEnrolledStudents.map((c, idx) => (
                    <tr key={c.enrollmentId} style={tableRow(idx)}>
                      <td style={{ padding: "10px" }}>{idx + 1}</td><td style={{ padding: "10px" }}>{c.studentName}</td><td style={{ padding: "10px" }}>{c.teacherName}</td><td style={{ padding: "10px" }}>{c.courseName}</td>
                      <td style={{ padding: "10px", textAlign: "center" }}><button onClick={() => deleteEnrolledCourse(c.enrollmentId)} style={btn("#ef4444")}>🗑️ Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p style={{ color: "#94a3b8" }}>No enrollments yet.</p>}
          </div>

        </div>
      )}
    </div>
  );
}

export default App;