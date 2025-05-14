import React, { useState } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { Button, Modal } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import api from "../../api/axios";
import logo from "../../assets/NDMSlogo.png"
const Register = () => {
  let navigate = useNavigate();

  //student verification
  const [verificationModal, setVerificationModal] = useState(false);
  const [verificationEmail ,setVerificationEmail] = useState('');
  const [verificationName ,setVerificationName] = useState('');
  const [OTP, setOTP] = useState(0);

  //Register Handler
  const registerHandler = async (values) => {

    setVerificationEmail(values.email);
    setVerificationName(values.studentName);

    const studentData = {
      studentName : values.studentName,
      enrollmentId : values.enrollmentId,
      fatherName : values.fatherName,
      email : values.email,
      password : values.password,
      mobileNumber : values.mobileNumber,
      year : values.year,
      semester : values.semester,
      branch : values.branch,
      batch : values.batch
    }

    try {
      const response2 = await api.post(
        "/auth/register",
        studentData
      );

      console.log(response2.data);

      if (!response2.data) {
        toast.error(
          "Student Account is already exist using this email or Enrollment ID"
        );
      } 
      else {
        otpSending(studentData.studentName,studentData.email)
      }

      // resetForm();
    } catch (error) {
      toast.error("Error while registration");
      console.log("Error occured while registering", error);
    }
  };

  //initialvalues
  const registerFormInitialValues = {
    studentName: "",
    enrollmentId: "",
    fatherName: "",
    email: "",
    password: "",
    confirmpassword: "",
    mobileNumber: "",
    year: "",
    semester: "",
    branch: "",
    batch: "",
  };

  //yup validations
  const validationSchema = Yup.object({
    studentName: Yup.string()
      .required()
      .min(3, " must be greater than 3 character")
      .max(16, " must be less than 16 character"),
    enrollmentId: Yup.string()
      .required()
      .min(12, "length must be greater than or equals 12"),
    fatherName: Yup.string()
      .required()
      .min(3, "must be greater than 3 character")
      .max(16, "must be less than 16 character"),
    email: Yup.string()
      .email("Email should follows the correct format")
      .required("Email is required"),
    password: Yup.string()
      .required()
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/,
        "Enter strongn password"
      ),
    confirmpassword: Yup.string()
      .required()
      .oneOf(
        [Yup.ref("password"), null],
        "Password & confirm password must be same"
      ),
    mobileNumber: Yup.number("It must be a number")
      .required(),
      year : Yup.number("It must be a number")
      .required(),
      semester : Yup.number().required(),
    branch: Yup.string().required(),
    batch: Yup.number("It should be a number").required(),
  });

  //formik
  const { values, errors, touched, handleSubmit, handleChange, handleBlur } =
    useFormik({
      initialValues: registerFormInitialValues,
      validationSchema,
      onSubmit: registerHandler,
    });


  //otpSending
  const otpSending = async (name, email) => {
    console.log(name,email+" 1234");
    try {
      //Otp sending
      const response = await api.post(
        `/email/emailSending/${name}/${email}`
      );

      if (response.data) {
        setVerificationModal(true);
        toast.success("OTP send successfully. If not get Please check your email address.");
        return true;
      } else {
        toast.error("Failed to send OTP. Please check your email address.");
        setVerificationModal(false);
        return false;
      }
    } catch (error) {
      toast.error("Error while sending otp");
      console.log("Error while sending otp" + error);
      return false;
    }
  };

  //otp verification
  const otpverification = async (email) => {
    try {
      if (OTP.length !== 4) {
        toast.error("OTP length must be 4 digit");
        return;
      }

      console.log(email + " : " + OTP);

      const response = await api.get(
        `/email/otpVerification/${email}/${OTP}`
      );
      if (response.data) {
        setVerificationModal(false);
        toast.success(
          "Registered Successfully  Welcome " + values.studentName + " 😊"
        );
        navigate("/");
      } else {
        toast.error("Invalid or Expired OTP");
      }
       console.log(response.data);
    } catch (error) {
      toast.error("Error while verifying otp");
      console.log(error);
    }

   
  };

  return (
    <>
      <div className="register d-flex flex-wrap flex-lg-nowrap flex-column flex-lg-row rounded-2 p-lg-3 min-vh-100 justify-content-center align-items-center">
        <div className="first-flex d-flex justify-content-center align-items-center w-sm-25">
          <img
            src={logo}
            alt="Login Image"
            className="w-50 rounded-5"
          />
        </div>

        <div className="form w-50 mt-3">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="studentName" className="form-label">
                Student Name
              </label>
              <input
                type="name"
                id="studentName"
                placeholder="Prakash Jat"
                className="form-control"
                name="studentName"
                value={values.studentName}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.studentName && touched.studentName ? (
                <span className="text-danger">{errors.studentName}</span>
              ) : null}
            </div>

            <div className="mb-3">
              <label htmlFor="enrollmentId" className="form-label">
                Enrollment Id
              </label>
              <input
                type="name"
                id="enrollmentId"
                placeholder="0822CS221130"
                className="form-control"
                name="enrollmentId"
                value={values.enrollmentId}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.enrollmentId && touched.enrollmentId ? (
                <span className="text-danger">{errors.enrollmentId}</span>
              ) : null}
            </div>

            <div className="mb-3">
              <label htmlFor="fatherName" className="form-label">
                Father Name
              </label>
              <input
                type="name"
                id="fatherName"
                placeholder="Mohan Jat"
                className="form-control"
                name="fatherName"
                value={values.fatherName}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.fatherName && touched.fatherName ? (
                <span className="text-danger">{errors.fatherName}</span>
              ) : null}
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
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
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
              autoComplete="off"
                type="password"
                className="form-control"
                id="password"
                placeholder="Password@123"
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
              <label htmlFor="confirmpassword" className="form-label">
                Confirm Password
              </label>
              <input
              autoComplete="off"
                type="password"
                className="form-control"
                id="confirmpassword"
                placeholder="Password@123"
                name="confirmpassword"
                value={values.confirmpassword}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.confirmpassword && touched.confirmpassword ? (
                <span className="text-danger">{errors.confirmpassword}</span>
              ) : null}
            </div>

            <div className="mb-3">
              <label htmlFor="mobileNumber" className="form-label">
                Mobile Number
              </label>
              <input
                type="number"
                className="form-control"
                id="mobileNumber"
                placeholder="9981567130"
                name="mobileNumber"
                value={values.mobileNumber}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.mobileNumber && touched.mobileNumber ? (
                <span className="text-danger">{errors.mobileNumber}</span>
              ) : null}
            </div>

            <div className="mb-3">
              <label htmlFor="year" className="form-label">
                Year
              </label>
              <input
                type="number"
                min={1}
                max={4}
                step={1}
                className="form-control"
                id="year"
                placeholder="1"
                name="year"
                value={values.year}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.year && touched.year ? (
                <span className="text-danger">{errors.year}</span>
              ) : null}
            </div>

            <div className="mb-3">
              <label htmlFor="semester" className="form-label">
                Semester
              </label>
              <input
                type="number"
                min={1}
                max={8}
                step={1}
                className="form-control"
                id="semester"
                placeholder="1"
                name="semester"
                value={values.semester}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.semester && touched.semester ? (
                <span className="text-danger">{errors.semester}</span>
              ) : null}
            </div>

            <div className="mb-3">
              <label htmlFor="branch" className="form-label">
                Branch
              </label>
              <input
                type="text"
                className="form-control"
                id="branch"
                placeholder="CSE"
                name="branch"
                value={values.branch}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.branch && touched.branch ? (
                <span className="text-danger">{errors.branch}</span>
              ) : null}
            </div>

            <div className="mb-3">
              <label htmlFor="batch" className="form-label">
                Batch
              </label>
              <input
                type="number"
                className="form-control"
                id="batch"
                placeholder="2026"
                name="batch"
                value={values.batch}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.batch && touched.batch ? (
                <span className="text-danger">{errors.batch}</span>
              ) : null}
            </div>

            <div className="d-grid gap-2">
              <button
                className="btn btn-outline-light fst-italic"
                type="submit"
              >
                Register
              </button>
            </div>

            <div className="d-flex gap-4 align-items-center register position-relative mt-lg-3 mt-3">
              <p className="fst-italic">Already Registered?</p>
              <Link
                to={"/"}
                className="mb-3 fst-italic fs-6 text-decoration-none"
              >
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>

      <Modal
        centered
        show={verificationModal}
        onHide={() => setVerificationModal(false)}
      >
        <Modal.Header>
          <h1>OTP Verification</h1>
        </Modal.Header>

        <Modal.Body>
          <p>4 Digit OTP sent to {verificationEmail}</p>
          <label htmlFor="otp">Enter OTP</label>
          <input type="text" onChange={(e) => setOTP(e.target.value)} />
        </Modal.Body>

        <Modal.Footer>
          <Button variant="success" onClick={() => otpverification(verificationEmail)}>
            Verify
          </Button>
          <Button
            onClick={() =>
              otpSending(verificationName,verificationEmail)
            }
          >
            Resend
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Register;
