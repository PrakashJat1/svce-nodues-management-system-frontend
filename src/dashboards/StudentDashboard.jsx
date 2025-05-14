import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import { Modal, Form, Button } from "react-bootstrap";
import api from "../api/axios";

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [nodues, setNodues] = useState([]);

  const [authorities, setAuthorities] = useState();
  2;

  //file uploading
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  //profile
  const [imageModal, setImageModal] = useState(false);
  const [userProfileModal, setUserprofileModal] = useState(false);
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [verifyUserModal, setVerifyUserModal] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState("");
  const [editProfileFormData, setEditProfileFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNo: "",
  });

  useEffect(() => {
    //Asynchronous function for ensuring the student is fetched
    const fetchingStudent = async () => {
      const fetchedUserEmail = localStorage.getItem("userEmail");
      fecthUserFromDB(fetchedUserEmail);
      const fetchedStudent = await fetchingStudentFromDB(fetchedUserEmail);
      if (fetchedStudent) {
        setStudent(fetchedStudent);
        await loadNoDuesDetails(fetchedStudent);
        await authoritiesFecthing();
      }
      setLoading(false); //loading stop
    };
    fetchingStudent();
  }, []);

  //fetch User from db
  const fecthUserFromDB = async (email) => {
    try {
      const response = await api.get(
        `/user/getUserByEmail/${email}`
      );

      if (response.data != null) {
        setUser(response.data);
        return response.data;
      } else {
        toast.error("Authority is not fetched from db");
      }
    } catch (error) {
      toast.error("Error while fetching from db");
      console.log(error);
    }
  };

  //fetchingStudentFromDB
  const fetchingStudentFromDB = async (email) => {
    try {
      const response = await api.get(
        `/students/getStudentByEmail/${email}`
      );
      setStudent(response.data);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  //load No Dues Details
  const loadNoDuesDetails = async (student) => {
    if (student) {
      const response = await api.get(
        `/noduesstatus/getByStudent/${student.id}`
      );
      setNodues(response.data);
    }
  };

  //give no dues request
  const noDuesRequest = async () => {
    if (student) {
      let response = await api.get(
        `/noduesstatus/request/${student.id}`
      );

      console.log(response.data);
      if (!response.data) {
        toast.error("Request is already sent");
      } else {
        loadNoDuesDetails(student);
        toast.success("Request send succesfully");
      }
    }
  };

  //authoritiesFecthing
  const authoritiesFecthing = async () => {
    try {
      const response = await api.get(
        "/authority/getAll"
      );
      if (response) {
        setAuthorities(response.data);
        // console.log(response.data);
      }
    } catch (error) {
      toast.error("Error while fetching authorities");
      console.log("Error while fetching authorities", error);
    }
  };

  //handleFileUploading
  const handleFileUploading = async () => {
    if (selectedDepartment == "") {
      toast.warning("Please select department first");
    } else if (fileName.trim() == "") {
      toast.warn("Please Enter the Document Description");
    } else if (selectedFile == null) {
      toast.warning("Please select the file");
    } else {
      //File restriction
      const allowedTypes = [
        "application/msword", // .doc
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
        "image/jpeg",
        "image/png",
      ];

      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error(
          "invalid file format, File format should be 👉 .doc,.docx,.jpg,.jpeg,.png 👈"
        );
        return;
      }

      let size = 10 * 1024 * 1024; //10 MB

      if (selectedFile.size > size) {
        toast.warn("File size should be less than 10MB 👈 ");
        return;
      }

      const formData = new FormData();
      formData.append("fileName", fileName);
      formData.append("file", selectedFile);
      formData.append("department", selectedDepartment);
      formData.append("studentId", student.id);
      try {
        const response = await api.post(
          "/file/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data) {
          setFileName("");
          setSelectedFile(null);
          setSelectedDepartment("");
          toast.success("File uploaded successfully");
        } else {
          toast.warn("File not uploaded");
        }
      } catch (error) {
        toast.error("File not uploaded please try again");
        console.log("Error in file uploading", error);
      }
      // Reset actual file input element
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  //check valid user for profile updation
  const isValidUser = async () => {
    setVerifyPassword("");

    if (verifyPassword.trim().length == 0) {
      toast.info("Please enter Password");
      return;
    }

    try {
      const response = await api.get(
        `/user/verify/${student.email}/${verifyPassword}`
      );

      if (response.status === 200 && response.data) {
        setVerifyUserModal(false);
        setEditProfileModal(true);
        console.log(student);
        toast.success("Verified");
      } else {
        toast.warn("Incorrect password");
      }
    } catch (error) {
      toast.error("Error while verifing the User");
      console.log("Error while verifying the User", error);
    }
  };

  //profile update handling
  const updateUserData = async () => {
    //profile picture handling
    if (selectedFile == null) {
      toast.warning("Please select the file");
    } else {
      //File restriction
      const allowedTypes = ["image/jpg", "image/jpeg", "image/png"];

      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error(
          "invalid file format, File format should be 👉 .jpg,.jpeg,.png 👈"
        );
        return;
      }

      let size = 10 * 1024 * 1024; //10 MB

      if (selectedFile.size > size) {
        toast.warn("File size should be less than 10MB 👈 ");
        return;
      }
      setEditProfileModal(false);

      const formData = new FormData();
      formData.append("email", student.email); //user email whose data to be updated
      formData.append(
        "user",
        new Blob([JSON.stringify(editProfileFormData)], {
          type: "application/json",
        })
      );
      formData.append("profilePicture", selectedFile);
      try {
        const response = await api.post(
          "/user/update",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.status === 200 && response.data) {
          student.email = editProfileFormData.email;
          student.password = editProfileFormData.password;
          setStudent(student);
          fecthUserFromDB(user.email);
          fetchingStudentFromDB(student.email);
          setSelectedFile(null);
          setUserprofileModal(true);
          toast.success("Profile Updated");
        } else {
          toast.warn("Profile not updated");
        }
      } catch (error) {
        toast.error("Error in Profile Update");
        console.log("Error in Profile Update", error);
      }
    }
  };

  //set default values in updated form feilds
  useEffect(() => {
    if (student) {
      setEditProfileFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        password: user.password || "",
        phoneNo: user.phoneNo || "",
      });
    }
  }, [user, verifyUserModal]);

  if (loading) {
    return <h1>loading.....</h1>;
  } else {
    return (
      <>
        <nav
          className="navbar bg-dark border-bottom border-body rounded w-100"
          data-bs-theme="dark"
        >
          <div className="d-flex justify-content-between">
            <div className=" ms-3 me-3 d-flex gap-3 w-10 h-10 align-items-center">
              <img
                onClick={() => setImageModal(true)}
                src="/src/assets/NDMSlogoWithBG.png"
                className="rounded-5 border border-3"
                style={{ width: "40px", height: "40px" }}
                alt="Profile Picture"
              />
              <span className="navbar-brand fs-3">
                No Dues Management System
              </span>
            </div>
          </div>
          <div className="right-div d-flex gap-2 position-relative align-items-center">
            <span
              className="text-light fs-2 "
              onClick={() => setUserprofileModal(true)}
              style={{ cursor: "pointer" }}
            >
              {user.fullName ? user.fullName : "Name"}
            </span>
            <p className="line text-light fs-1">|</p>
            <Link
              to={"/"}
              type="button"
              className="btn btn-light text-decoration-none fs-6 me-sm-3 ms-sm-3"
            >
              LogOut
            </Link>
          </div>
        </nav>

        {/* Main Section */}
        <div className="main-div d-flex flex-column flex-sm-row w-100 min-vh-100 gap-3 bg-light p-3">
          {/* Sidebar */}
          <div className="sidebar d-flex flex-column gap-3 pt-3 pb-3 bg-light w-25 rounded-2 shadow-sm">
            <span>
              <i className="fa-solid fa-user fa-lg"></i>
              <b className="Stu-profile fs-4 ms-2">Student Profile</b>
            </span>

            <table className="table table-borderless">
              <tbody>
                <tr>
                  <td>
                    <strong>Name:</strong>
                  </td>
                  <td>{student.studentName}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Roll No:</strong>
                  </td>
                  <td>{student.enrollmentId}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Branch:</strong>
                  </td>
                  <td>{student.branch}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Semester:</strong>
                  </td>
                  <td>{student.semester}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Year:</strong>
                  </td>
                  <td>{student.year}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* No Dues Section */}
          <div className="nodues-div w-75 h-auto p-4 bg-light rounded shadow-sm">
            <div className="request-div d-flex justify-content-between align-items-center mb-4">
              <h2 className="nodues-div-heading fs-3">
                <i className="fa-solid fa-book me-2"></i> No Dues Status
                Overview
              </h2>
              <button onClick={noDuesRequest} className="btn btn-primary">
                No Dues Request
              </button>
            </div>
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {nodues.map((e, index) => (
                  <tr className="table-primary" key={"nodues_101_" + index}>
                    <td>{e.departmentName}</td>
                    <td>
                      {e.status === "PENDING" ? (
                        <i className="fa-regular fa-hourglass-half fa-spin text-warning"></i>
                      ) : e.status === "APPROVED" ? (
                        <i className="fa-solid fa-check text-success"></i>
                      ) : (
                        <i className="fa-solid fa-xmark text-danger"></i>
                      )}
                    </td>
                    <td>
                      {e.status == "APPROVED"
                        ? "Best Of Luck For Exam👍"
                        : e.status == "REJECTED"
                        ? "REJECTED"
                        : e.remark}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Upload Document */}
            <div className="upload-document position-relative mt-5">
              <h5>
                <i className="fa-solid fa-file-upload me-2"></i> Upload Required
                Document
              </h5>

              <div className="input-group my-3">
                <label
                  className="input-group-text"
                  htmlFor="inputGroupSelect01"
                >
                  Select Department
                </label>
                <select
                  className="form-select"
                  id="inputGroupSelect01"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  <option value="">Choose...</option>
                  {authorities
                    ? authorities
                        .filter((auth) => auth.status)
                        .map((auth) => (
                          <option
                            key={auth.designation}
                            value={auth.designation}
                          >
                            {auth.designation}
                          </option>
                        ))
                    : ""}
                </select>
              </div>

              <div className="d-flex gap-lg-4 gap-sm-2 input-group mb-4">
                <div className="d-flex">
                  <label
                    className="input-group-text"
                    htmlFor="inputGroupSelect02"
                  >
                    Document Description
                  </label>
                  <input
                    type="text"
                    placeholder="File Info"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                  />
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".doc,.docx,.jpg,.jpeg,.png"
                  required
                  placeholder="Select a file .pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    setSelectedFile(e.target.files[0]);
                  }}
                />
                <button
                  className="btn btn-info"
                  onClick={() => handleFileUploading()}
                >
                  Upload
                </button>
              </div>
            </div>

            {/* Download Certificate */}
            <div className="download d-flex flex-column gap-3 mt-5">
              <h6>
                <i className="fa-solid fa-download me-2"></i> Download Final No
                Dues Certificate
              </h6>
              <h6 className="text-success">
                <i className="fa-solid fa-circle-check me-2"></i> All
                departments cleared! Download available.
              </h6>
              <button className="btn btn-success">Download Certificate</button>
            </div>
          </div>
        </div>

        {/* Image modal */}
        <Modal show={imageModal} onHide={() => setImageModal(false)} centered>
          <div className="text-center w-100 h-100">
            <img
              src="/src/assets/NDMSlogoWithBG.png"
              className="rounded-2 border border-3 border-success w-100 h-75 "
              alt="Profile Picture"
            />
          </div>
        </Modal>

        {/*Student Profile modal  */}
        <Modal
          show={userProfileModal}
          onHide={() => setUserprofileModal(false)}
          centered
        >
          <div className="container mt-5 mb-5 d-flex justify-content-center">
            <div className="card shadow-lg rounded-4 pt-4">
              <div className="text-center w-100 h-5">
                <img
                  src={
                    user.profile_picture_url
                      ? user.profile_picture_url
                      : "/src/assets/dummyProfile.png"
                  }
                  className="rounded-circle border border-3 border-success w-50 h-75 "
                  alt="Profile Picture"
                />
              </div>
              <h4 className="text-center fw-bold mb-3" id="userName">
                {student.fullName}
              </h4>

              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between">
                  <strong>Email:</strong>
                  <span id="userEmail">{student.email}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <strong>Password:</strong> <span>********</span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <strong>Role:</strong>
                  <span id="userRole">STUDENT</span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <strong>Status:</strong>
                  <span className="badge bg-success" id="userStatus">
                    {student.verified ? "Active" : "Deactivate"}
                  </span>
                </li>
              </ul>

              <div className="text-center mt-4 mb-4">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setUserprofileModal(false);
                    setVerifyUserModal(true);
                  }}
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </Modal>

        {/* Verify User Modal */}
        <Modal
          show={verifyUserModal}
          onHide={() => {
            setVerifyUserModal(false);
            setVerifyPassword("");
          }}
        >
          <Modal.Header>
            <h3>User Verification</h3>
          </Modal.Header>
          <Modal.Body>
            <Form.Group onSubmit={() => isValidUser()}>
              <Form.Label>Enter Your password</Form.Label>
              <Form.Control
                required
                type="password"
                autoComplete="new-password"
                placeholder="********"
                value={verifyPassword}
                onChange={(e) => setVerifyPassword(e.target.value)}
              ></Form.Control>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="success" onClick={() => isValidUser()}>
              Verify
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setVerifyPassword("");
                setVerifyUserModal(false);
                setUserprofileModal(true);
              }}
            >
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>

        {/*Profile update modal  */}
        <Modal
          show={editProfileModal}
          onHide={() => setEditProfileModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Update Profile</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  required
                  type="text"
                  value={
                    editProfileFormData.fullName.trim() == ""
                      ? user.fullName
                      : editProfileFormData.fullName
                  }
                  onChange={(e) =>
                    setEditProfileFormData({
                      ...editProfileFormData,
                      fullName: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  required
                  type="email"
                  placeholder="Enter email"
                  value={
                    editProfileFormData.email.trim() == ""
                      ? student.email
                      : editProfileFormData.email
                  }
                  onChange={(e) =>
                    setEditProfileFormData({
                      ...editProfileFormData,
                      email: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="**********"
                  value={
                    editProfileFormData.password.trim() == ""
                      ? student.password
                      : editProfileFormData.password
                  }
                  onChange={(e) =>
                    setEditProfileFormData({
                      ...editProfileFormData,
                      password: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Profile Picture</Form.Label>
                <Form.Control
                  required
                  type="file"
                  placeholder="dfwfqwfwef"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Phone No</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Enter Phone No"
                  value={
                    editProfileFormData.phoneNo == ""
                      ? student.mobileNumber
                      : editProfileFormData.phoneNo
                  }
                  onChange={(e) =>
                    setEditProfileFormData({
                      ...editProfileFormData,
                      phoneNo: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                setEditProfileModal(false);
                setUserprofileModal(true);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              onClick={() => {
                updateUserData();
              }}
            >
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
};

export default StudentDashboard;
