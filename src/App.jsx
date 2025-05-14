import React from 'react'
import StudentDashboard from './dashboards/StudentDashboard'
import AdminDashboard from './dashboards/AdminDashboard'
import AuthorityDashboard from './dashboards/AuthorityDashboard'
import { ToastContainer } from 'react-toastify'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import {Routes,Route } from 'react-router-dom';
import  { DataContext } from './context/UserContext'
import ForgetPassword from './components/Auth/ForgetPassword'


const App = () => {
  return (
    <>
      <Routes>
        <Route exact path='/' element={<Login/>}/>
        <Route exact path='/forget-passowrd' element={<ForgetPassword/>}/>
        <Route exact path='/register' element={<Register/>}/>
        <Route exact path='/authority-dashboard' element={<AuthorityDashboard/>}/>    
        <Route exact path='/admin-dashboard' element={<AdminDashboard/>}/>
        <Route exact path='/student-dashboard' element={<StudentDashboard/>}/>
      </Routes>
      <ToastContainer/>
    </>
  )
}

export default App