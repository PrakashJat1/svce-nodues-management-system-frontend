import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Modal, Button, Form, Tab } from "react-bootstrap";
import PendingStudentsTable from "../components/AuthorityDashBoardTables/PendingStudentsTable";
import RejectedStudentsTable from "../components/AuthorityDashBoardTables/RejectedStudentsTable";
import ApprovedStudentsTable from "../components/AuthorityDashBoardTables/ApprovedStudentsTable";
import DocumentsTable from "../components/AuthorityDashBoardTables/DocumentsTable";
import api from "../api/axios";
import logoWithBG from "../assets/NDMSlogoWithBG.png";
import "bootstrap/dist/js/bootstrap.bundle.min.js"; // 🔥 Enables dropdown, modal, collapse, etc.
import Loader from "../components/Loader";
import dummyProfilePhoto from "../assets/dummyProfile.png"

const AuthorityDasboard = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Pending");
  const [user, setUser] = useState(null);
  const [authority, setAuthority] = useState(null);
  const [allNoDuesStatus, setAllNoDUesStatus] = useState([]);
  const [allDocumentedStudents, setAllDocumentedStudents] = useState(0);

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
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const fetchingAuthority = async () => {
      const userEmail = localStorage.getItem("userEmail");
      await fecthUserFromDB(userEmail);
      const fetchedAuthority = await fecthAuthorityFromDB(userEmail);
      getAllNoDuesStatus(fetchedAuthority);
      countAllDocumentedStudentByAuthority(fetchedAuthority);

      setLoading(false);
    };

    fetchingAuthority();
  }, []);

  //fetch User from db
  const fecthUserFromDB = async (email) => {
    try {
      const response = await api.get(`/user/getUserByEmail/${email}`);

      if (response.data != null) {
        toast.success("Successfully updated");
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

  //fetch authority from db
  const fecthAuthorityFromDB = async (email) => {
    try {
      const response = await api.get(`/authority/getAuthorityByEmail/${email}`);

      if (response.data != null) {
        toast.success("Successfully updated");
        setAuthority(response.data);
        return response.data;
      } else {
        toast.error("Authority is not fetched from db");
      }
    } catch (error) {
      toast.error("Error while fetching from db");
      console.log(error);
    }
  };

  //getAllNoDuesStatus
  const getAllNoDuesStatus = async (authority) => {
    try {
      const response = await api.get(
        `/noduesstatus/getAllByAuthority/${authority.id}`
      );

      if (response.data.length > 0) {
        setAllNoDUesStatus(response.data);
      } else {
        toast.info("Thier are not present any no dues status..!🥲");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error while fetching all no dues status");
    }
  };

  ////countAllDocumentedStudentByAuthority
  const countAllDocumentedStudentByAuthority = async (authority) => {
    try {
      const response = await api.get(
        `/file/countAllDocumentedStudentByAuthority/${authority.id}`
      );

      if (response.data > 0) {
        setAllDocumentedStudents(response.data);
      } else {
        setAllDocumentedStudents(0);
      }
    } catch (error) {
      toast.error("Error while countAll Documented Student By Authority");
      console.log(error);
    }
  };

  //changeTab
  const changeTab = (tab) => {
    getAllNoDuesStatus(authority);
    countAllDocumentedStudentByAuthority(authority);

    switch (tab) {
      case "Pending":
        if (
          allNoDuesStatus.filter(
            (noduesstaus) => noduesstaus.status === "PENDING"
          ).length === 0
        ) {
          toast.info("Thier are no pending requests are present");
        } else {
          setActiveTab(tab);
        }
        break;

      case "Approved":
        if (
          allNoDuesStatus.filter(
            (noduesstaus) => noduesstaus.status === "APPROVED"
          ).length === 0
        ) {
          toast.info("Thier no approved requests are present");
        } else {
          setActiveTab(tab);
        }
        break;

      case "Rejected":
        if (
          allNoDuesStatus.filter(
            (noduesstaus) => noduesstaus.status === "REJECTED"
          ).length === 0
        ) {
          toast.info("Thier no rejected requests are present");
        } else {
          setActiveTab(tab);
        }
        break;

      case "Documents":
        if (allDocumentedStudents === 0) {
          toast.info("Thier is no documents are present");
        } else {
          setActiveTab(tab);
        }

        break;

      default:
        break;
    }
  };

  //check valid user for profile updation
  const isValidUser = async () => {

    if (verifyPassword.trim().length == 0) {
      toast.info("Please enter Password");
      return;
    }

    try {
      const response = await api.get(
        `/user/verify/${authority.email}/${verifyPassword}`
      );

      if (response.data) {
        setVerifyUserModal(false);
        setEditProfileModal(true);
        setEditProfileFormData((prevData) => ({
          ...prevData,
          password: verifyPassword,
        }));
        toast.success("Verified");
      } else {
        toast.warn("Incorrect password");
      }
    } catch (error) {
      toast.error("Error while verifing the User");
      console.log("Error while verifying the User", error);
    }
  };

  //set default values in updated form feilds
  useEffect(() => {
    if (authority) {
     setEditProfileFormData((prevData) => ({
        ...prevData,
        fullName: user.fullName || "",
        email: user.email || "",
        phoneNo: user.phoneNo || "",
      }));
    }
  }, [user, verifyUserModal]);

  //profile update handling
  const updateUserData = async () => {

    setVerifyPassword("");
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
      formData.append("email", user.email); //user email whose data to be updated
      formData.append(
        "user",
        new Blob([JSON.stringify(editProfileFormData)], {
          type: "application/json",
        })
      );
      formData.append("profilePicture", selectedFile);
      try {
        const response = await api.post("/user/update", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data) {
          localStorage.setItem("userEmail", editProfileFormData.email);
          fecthAuthorityFromDB(editProfileFormData.email);

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

  if (loading) {
    return <Loader/>
  } else
    return (
      <>
        <nav
          className="navbar bg-dark border-bottom border-body rounded-2 "
          data-bs-theme="dark"
        >
          <div className="d-flex justify-content-between">
            <div className=" ms-3 me-3 d-flex gap-3 w-10 h-10 align-items-center">
              <img
                onClick={() => setImageModal(true)}
                src={logoWithBG}
                className="rounded-5 border border-3"
                style={{ width: "40px", height: "40px" }}
                alt="Profile Picture"
              />

              <span className="navbar-brand fs-2">Authority Dashboard</span>
            </div>
          </div>

          {/* Right Section: Desktop and Mobile Combined */}
          <div className="d-flex align-items-center gap-4 me-3">
            {/* Desktop View */}
            <div className="d-none d-md-flex align-items-center gap-3">
              <span
                className="text-light fs-5"
                style={{ cursor: "pointer" }}
                onClick={() => setUserprofileModal(true)}
              >
                {user.fullName || "Name"}
              </span>
              <Link type="button" className="btn btn-light btn-sm" to="/">
               🚪 LogOut
              </Link>
            </div>

            {/* Mobile View: 3-dot Dropdown using Bootstrap */}
            <div className="dropdown d-md-none">
              <button
                className="btn btn-outline-light"
                type="button"
                id="dropdownMenuButton"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                ⋮
              </button>
              <ul
                className="dropdown-menu dropdown-menu-end"
                aria-labelledby="dropdownMenuButton"
              >
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => setUserprofileModal(true)}
                  >
                    👤 Profile
                  </button>
                </li>
                <li>
                  <Link to="/" className="dropdown-item">
                    🚪 LogOut
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <div className="first-flex d-flex mt-4 mb-1 ms-4 me-1 justify-content-center gap-4 align-items-center">
          <div className="inner-div w-40 h-auto rounded border-dark-subtle text-center ">
            <h1>
              {
                allNoDuesStatus.filter(
                  (noduesstaus) => noduesstaus.status === "PENDING"
                ).length
              }
            </h1>
            <button
              className="btn btn-info"
              onClick={() => changeTab("Pending")}
            >
              Pending Requests
            </button>
          </div>

          <div className="inner-div w-40 h-auto rounded border-dark-subtle text-center">
            <h1>
              {
                allNoDuesStatus.filter(
                  (noduesstaus) => noduesstaus.status === "APPROVED"
                ).length
              }
            </h1>
            <button
              className="btn btn-info"
              onClick={() => changeTab("Approved")}
            >
              Approved Students
            </button>
          </div>

          <div className="inner-div w-40 h-auto rounded border-dark-subtle text-center">
            <h1>
              {
                allNoDuesStatus.filter(
                  (noduesstaus) => noduesstaus.status === "REJECTED"
                ).length
              }
            </h1>
            <button
              className="btn btn-info"
              onClick={() => changeTab("Rejected")}
            >
              Rejected Students
            </button>
          </div>

          <div className="inner-div w-40 h-auto rounded border-dark-subtle text-center">
            <h1>{allDocumentedStudents}</h1>
            <button
              className="btn btn-info"
              onClick={() => changeTab("Documents")}
            >
              Documents
            </button>
          </div>
        </div>

        {activeTab === "Pending" && (
          <PendingStudentsTable authorityFromParent={authority} />
        )}
        {activeTab === "Approved" && (
          <ApprovedStudentsTable authorityFromParent={authority} />
        )}
        {activeTab === "Rejected" && (
          <RejectedStudentsTable authorityFromParent={authority} />
        )}
        {activeTab === "Documents" && (
          <DocumentsTable authorityFromParent={authority} />
        )}

        {/* Image modal */}
        <Modal show={imageModal} onHide={() => setImageModal(false)} centered>
          <div className="text-center w-100 h-100">
            <img
              src={logoWithBG}
              className="rounded-2 border border-3 border-success w-100 h-75 "
              alt="Profile Picture"
            />
          </div>
        </Modal>

        {/*Authority Profile modal  */}
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
                      : dummyProfilePhoto
                  }
                  className="rounded-circle border border-3 border-success w-50 h-75 "
                  alt="Profile Picture"
                />
              </div>
              <h4 className="text-center fw-bold mb-3" id="userName">
                {user.fullName}
              </h4>

              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between">
                  <strong>Email:</strong>
                  <span id="userEmail">{user.email}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <strong>Password:</strong> <span>********</span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <strong>Role:</strong>
                  <span id="userRole">AUTHORITY</span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <strong>Designation:</strong>
                  <span id="userRole">{authority.designation}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <strong>Status:</strong>
                  <span className="badge bg-success" id="userStatus">
                    {user.verified ? "Active" : "Deactivate"}
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
            <Form onSubmit={updateUserData}>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  name="fullName"
                  type="text"
                  value={
                    editProfileFormData.fullName == ""
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
                  name="email"
                  type="email"
                  placeholder="Enter email"
                  value={
                    editProfileFormData.email == ""
                      ? user.email
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
                  autoComplete="off"
                  name="password"
                  type="password"
                  placeholder="Password@123"
                  value={
                    editProfileFormData.password == ""
                      ? verifyPassword
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
                      ? user.phoneNo
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
              onClick={() => updateUserData()}
            >
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
};

export default AuthorityDasboard;
