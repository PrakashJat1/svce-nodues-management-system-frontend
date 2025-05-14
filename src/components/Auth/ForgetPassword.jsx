import { useFormik } from "formik";
import * as Yup from "yup";
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/axios";
import logo from "../../assets/NDMSlogo.png"

const ForgetPassword = () => {
  let navigate = useNavigate("");

  const handleForgetPassword = async (values, { resetForm }) => {

    try {
      const user = {
        email: values.email,
        password: values.password,
      };
      const response = await api.post(
        "/auth/forgetPassword",
        user
      );

      if (response.data) {
        toast.success("Password updated successfully");
        navigate("/");
      } else {
        toast.error("Invalid Email");
      }

      resetForm();
    } catch (error) {
      toast.error("Error while forgot password");
      console.log("Error while forgot password", error);
    }
  };

  const initialValues = {
    email: "",
    password: "",
    confirmPassword: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string().required().email("Email format must be suppoted"),
    password: Yup.string()
      .required()
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/,
        "Enter strong password"
      ),
    confirmPassword: Yup.string()
      .required()
      .oneOf(
        [Yup.ref("password"), null],
        "Password & confirm password must be same"
      ),
  });
  //formik
  const { values, touched, errors, handleChange, handleBlur, handleSubmit } =
    useFormik({
      initialValues,
      validationSchema,
      onSubmit: handleForgetPassword,
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

        <h1 className=" fst-italic">Forgot Password</h1>

        <div className="form w-50 mt-3">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label fs-6 text-black">
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
                <span className="text-danger">{errors.email}</span>
              ) : null}
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label text-black fs-6">
                New Password
              </label>

              <input
                type="password"
                className="form-control"
                id="password"
                autoComplete="new-password"
                placeholder="password"
                name="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.password && touched.password ? (
                <span className="text-danger">{errors.password}</span>
              ) : null}
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label text-black fs-6">
                Confirm New Password
              </label>

              <input
                type="password"
                className="form-control"
                id="confirmpassword"
                autoComplete="new-password"
                placeholder="confirm password"
                name="confirmPassword"
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.confirmPassword && touched.confirmPassword ? (
                <span className="text-danger">{errors.confirmPassword}</span>
              ) : null}
            </div>
            <div className=" d-flex justify-content-evenly align-items-center flex-wrap flex-sm-nowrap flex-sm-column flex-lg-row gap-sm-3">
              <button
                type="submit"
                className=" fst-italic btn btn-outline-light rounded-2 "
              >
                Reset Password
              </button>
            </div>
            <div className="register d-flex position-relative mt-4 align-items-center gap-2 gap-sm-3 gap-lg-3 flex-lg-row">
              <p className=" fst-italic mt-3">Remember your password?</p>
              <Link to={"/"} className=" fst-italic text-decoration-none fs-6">
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ForgetPassword;
