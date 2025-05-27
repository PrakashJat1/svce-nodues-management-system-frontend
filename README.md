# SVCE No Dues Management System 🧾

A full-stack **No Dues Management System** for **Sri Venkateshwara College of Engineering (SVCE)** built using **React** for the frontend and **Spring Boot** for the backend. The system helps automate the process of managing and tracking student clearance statuses across various departments before issuing final certificates.

---

## 🚀 Features

- 🔐 User Authentication (Student, Admin, Department)
- 📋 Submit and track no-dues requests
- 🏢 Department-wise clearance and approval system
- 📊 Admin dashboard for monitoring and reports
- 📩 Notification system for pending/approved/rejected requests
- 🧾 Download clearance reports

---

## 🛠️ Tech Stack

### Frontend (React.js)
- React Hooks
- Axios for API requests
- React Router
- Bootstrap / Tailwind CSS (Optional)
- JWT Authentication (via backend)

### Backend (Spring Boot)
- Spring Boot (REST API)
- Spring Security (for role-based access)
- Hibernate + JPA
- MySQL Database
- Swagger (API Documentation)

---

## 🔗 API Endpoints (Sample)

- `POST /api/auth/login` – Login user
- `GET /api/students/{id}` – Get student details
- `POST /api/requests` – Submit no-dues request
- `GET /api/departments/pending` – Get pending dues per department
- `PUT /api/departments/approve/{id}` – Approve a student's dues
- `GET /api/admin/reports` – Generate reports

---

## 📁 Project Structure

### Frontend (`/frontend`)
src/ ├── App.js ├── index.js

### Backend (`/backend`)
src/ ├── controller/ ├── service/ ├── repository/ ├── entity/ ├── security/ ├── application.properties


---

## 🧑‍💻 How to Run

### Backend
1. Open backend in IDE (e.g., IntelliJ, Eclipse)
2. Configure `application.properties` with MySQL DB credentials
3. Run the Spring Boot application
4. Visit `http://localhost:8080/swagger-ui.html` to test APIs

### Frontend
1. Navigate to `/frontend`
2. Run `npm install`
3. Run `npm start`
4. Visit `http://localhost:3000`

---

## 📌 Future Enhancements

- Email/SMS Notifications
- Export final clearance certificates as PDF
- Mobile Responsive UI
- Role management via Admin Panel

---

## 📷 Screenshots

*(uploaded soon)*

---

## 👨‍💻 Developed By

Prakash Jat 
Student | InfoBeans Foundation | SVCE  
GitHub: https://github.com/PrakashJat1
Email: [prakashjatt966@gmail.com](mailto:prakashjatt966@gmail.com)


---

## 📄 License

This project is open-source and free to use for educational purposes.
