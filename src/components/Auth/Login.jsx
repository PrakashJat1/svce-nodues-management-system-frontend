import { useFormik } from "formik";
import * as Yup from "yup";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/axios";
import logo from "../../assets/NDMSlogo.png"

const Login = () => {
  let navigate = useNavigate();

  //yup validations
  const loginSchema = Yup.object({
    email: Yup.string()
      .email("Email should follows the correct format")
      .required("Email is required"),
    password: Yup.string()
      .required("password is required")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/,"Enter strongn password")
  });

  //formik
  const loginInitialValues = {
    email: "",
    password: "",
  };

  const handleLogin = async (values,{resetForm}) => {

       

    const loginUser = {
      email: values.email,
      password: values.password,
    };

    try {
      const response = await api.post(
        "/auth/login",
        loginUser
      );
      resetForm();
      
      console.log(response.data);
      if (response.data == "") {
        toast.error("Invalid Email or Password");
        return;
      } else if (response.status === 200) {
        const role = response.data;
        if (role == "notverified") {
          toast.error("wait for admin approval");
          return;
        } else if (role == "STUDENT") {
          localStorage.setItem("userEmail", loginUser.email);
          navigate("/student-dashboard");
        } else if (role == "AUTHORITY") {
          localStorage.setItem("userEmail", loginUser.email);
          navigate("/authority-dashboard");
        } else if (role == "ADMIN") {
          localStorage.setItem("userEmail", JSON.stringify(loginUser.email));
          navigate("/admin-dashboard");
        }
      }

      
    } catch (error) {
      toast.error("Error while login", error);
    }
  };

  const { values, errors, touched, handleChange, handleSubmit, handleBlur } =
    useFormik({
      initialValues: loginInitialValues,
      validationSchema: loginSchema,
      onSubmit: handleLogin,
    });

  return (
    <>
      <div className="login d-flex flex-wrap flex-lg-nowrap flex-column flex-lg-row rounded-2 p-lg-3 min-vh-100 justify-content-center align-items-center">
        <div className="first-flex d-flex flex-column justify-content-center align-items-center">
          <img
            src={logo}
            alt="Login Image"
            className="w-50 rounded-5"
          />
        </div>

        <div className="form w-50 mt-3">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label fs-5 text-black">
                Email
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                autoComplete="new-password"
                placeholder="you@example.com"
                name="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.email && touched.email ? (
                <span className=" text-danger">{errors.email}</span>
              ) : null}
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label text-black fs-5">
                Password
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                autoComplete="new-password"
                placeholder="*****************"
                name="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.password && touched.password ? (
                <span className=" text-danger">{errors.password}</span>
              ) : null}
            </div>
            <Link
                to={"/forget-passowrd"}
                className=" align-self-start me-5 text-light text-decoration-none fs-6"
              >
                forget password?
              </Link>
            <div className=" d-flex justify-content-evenly align-items-center flex-wrap flex-sm-nowrap flex-sm-column flex-lg-row gap-sm-3">
              <button
                type="submit"
                // onClick={(e) => handleLogin(e)}
                className=" fst-italic btn btn-outline-light rounded-2 "
              >
                Login
              </button>
            </div>
            <div className="register d-flex position-relative mt-4 align-items-center gap-2 gap-sm-3 gap-lg-3 flex-lg-row">
              <p className=" fst-italic mt-3">Not Register Yet?</p>
              <Link
                to={"/register"}
                className=" fst-italic text-decoration-none fs-6"
              >
                Register
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
