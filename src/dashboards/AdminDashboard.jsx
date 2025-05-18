import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button, Form, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import logoWithBG from "../assets/NDMSlogoWithBG.png";

// ag grid

import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";

import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { ModuleRegistry } from "@ag-grid-community/core";
import { useFormik } from "formik";
import * as Yup from "yup";
import api from "../api/axios";
import "bootstrap/dist/js/bootstrap.bundle.min.js"; // 🔥 Enables dropdown, modal, collapse, etc.
import Loader from "../components/Loader";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [noduesstatus, setNoduesstatus] = useState([]);

  const [totalUsers, setTotalUsers] = useState(0);
  const [totalAuthorities, setTotalAuthorities] = useState(0);
  const [authorities, setAuthorities] = useState([]);

  //Modals
  const [addAuthorityModal, setAddAuthorityModal] = useState(false);
  const [deleteAllAuthorityModal, setDeleteAllAuthorityModal] = useState(false);
  const [deleteAllStudentModal, setDeleteAllStudentModal] = useState(false);
  const [suspendAllAuthorityModal, setSuspendAllAuthorityModal] =
    useState(false);
  const [imageModal, setImageModal] = useState(false);

  //profile
  const [userProfileModal, setUserprofileModal] = useState(false);
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [verifyUserModal, setVerifyUserModal] = useState(false);
  const [verifyPassword, setVerifyPassord] = useState("");

  const [editProfileFormData, setEditProfileFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone_no: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userEmail = JSON.parse(localStorage.getItem("userEmail"));
      await fecthUserFromDB(userEmail);
      await fetchAllUsers();
      fetchAllNoDuesStatus();
      authoritiesFecthing();
      setLoading(false);
    };

    if (students.length === 0) {
      studentsFetching();
    }

    fetchUser();
  }, []);

  //Students table
  const [gridApi, setGridApi] = useState(null);

  const [studentTableData, setStudentTableData] = useState([]);

  const [studentTableColumnDefinition] = useState([
    {
      headerName: "EnrollmentId",
      field: "EnrollmentId",
      flex: 1,
      filter: true,
      sortable: true,
    },
    {
      headerName: "Name",
      field: "Name",
      flex: 1,
      filter: true,
      sortable: true,
    },
    {
      headerName: "Email",
      field: "Email",
      flex: 1,
      filter: true,
      sortable: true,
    },
    {
      headerName: "Branch",
      field: "Branch",
      flex: 1,
      filter: true,
      rowGroup: true,
      sortable: true,
      // hide: true,
    },
    {
      headerName: "MobileNo",
      field: "MobileNo",
      flex: 1,
      filter: true,
      sortable: true,
    },
    {
      headerName: "Status",
      field: "Status",
      flex: 1,
      filter: true,
      sortable: true,
    },
    {
      headerName: "Select",
      width: 100,
      headerCheckboxSelection: true, // Show checkbox in header
      checkboxSelection: true, // Show checkbox in each row
      flex: 1,
    },
  ]);

  useEffect(() => {
    if (students.length > 0) {
      setStudentTableData(
        students.map((student, index) => ({
          SNo: index + 1,
          EnrollmentId: student.enrollmentId.toUpperCase(),
          Name: student.studentName,
          Branch: student.branch,
          Email: student.email,
          MobileNo: student.mobileNumber,
          Status: student.status ? "Activated" : "Suspended",
        }))
      );
    }
  }, [students]);

  //set default values in updated form feilds
  useEffect(() => {
    if (admin) {
      setEditProfileFormData({
        fullName: admin.fullName || "",
        email: admin.email || "",
        phoneNo: admin.phoneNo || "",
      });
    }
  }, [admin, verifyUserModal]);

  //fetch User from db
  const fecthUserFromDB = async (email) => {
    try {
      const response = await api.get(`/user/getUserByEmail/${email}`);

      if (response.data != null) {
        toast.success("Successfully updated");
        setAdmin(response.data);
        return response.data;
      } else {
        toast.error("Authority is not fetched from db");
      }
    } catch (error) {
      toast.error("Error while fetching from db");
      console.log(error);
    }
  };

  //fetchAllUsers
  const fetchAllUsers = async () => {
    try {
      const response = await api.get("/user/getAll");
      if (response.data) {
        setUsers(response.data);
        setTotalUsers(response.data.length);
      }
    } catch (error) {
      toast.error("Error while fetching users");
      console.log("Error while fetching users", error);
    }
  };

  //fetchAllNoDuesStatus
  const fetchAllNoDuesStatus = async () => {
    try {
      const response = await api.get("/noduesstatus/getAll");
      if (response) {
        setNoduesstatus(response.data);
      }
    } catch (error) {
      toast.error("Error while fetching NoDuesStatus");
      console.log("Error while fetching NoDuesStatus", error);
    }
  };

  //authoritiesFecthing
  const authoritiesFecthing = async () => {
    try {
      const response = await api.get("/authority/getAll");
      if (response) {
        setAuthorities(response.data);
        setTotalAuthorities(response.data.length);
      }
    } catch (error) {
      toast.error("Error while fetching authorities");
      console.log("Error while fetching authorities", error);
    }
  };

  //studentsfetching
  const studentsFetching = async () => {
    try {
      const response = await api.get("/students/getAll");
      if (response) {
        response.data.sort((a, b) => a - b);
        setStudents(response.data);
      }
    } catch (error) {
      toast.error("Error while fetching students");
      console.log("Error while fetching students", error);
    }
  };

  //setting the nodues table data
  const result = authorities.map((auth) => {
    const related = noduesstatus.filter(
      (item) => Number(item.authorityId) === Number(auth.id)
    );

    const approved = related.filter((r) => r.status === "APPROVED").length;
    const rejected = related.filter((r) => r.status === "REJECTED").length;
    const pending = related.filter((r) => r.status === "PENDING").length;

    // console.log(auth.designation, related.length, approved, rejected, pending);

    return {
      designation: auth.designation,
      approved,
      rejected,
      pending,
    };
  });

  const toggleAuthorityStatus = async (email) => {
    try {
      const responseFromAuthority = await api.post(
        `/authority/toggleAuthorityStatus/${email}`
      );

      if (responseFromAuthority.data) {
        setAuthorities((prevAuthorities) =>
          prevAuthorities.map((auth) =>
            auth.email == email ? responseFromAuthority.data : auth
          )
        );
        fetchAllUsers();
        fetchAllNoDuesStatus();
        toast.success("Authority status updated successfully");
      } else {
        toast.error("Authority status could not be toggle!");
      }
    } catch (error) {
      toast.error("Error while updating the authority status");
      console.log(error);
    }
  };

  //deleteAuthorityPermanently
  const deleteAuthority = async (email) => {
    try {
      const response = await api.delete(`/authority/deleteAuthority/${email}`);
      if (response.data) {
        fetchAllUsers();
        authoritiesFecthing();
        fetchAllNoDuesStatus();
        toast.success("Authority deleted successfully👍");
      }
    } catch (error) {
      toast.error("Error while deleting authority");
      console.log("Error while deleting authority", error);
    }
  };

  //activateAllStudents
  const activateAllStudents = async () => {
    if (!gridApi) return;
    const selectedRows = gridApi.getSelectedRows();

    if (selectedRows.length === 0) {
      toast.info("Please select students to activate");
      return;
    }

    const updateData = studentTableData.map((student) => {
      if (
        selectedRows.some(
          (selected) => selected.EnrollmentId === student.EnrollmentId
        )
      ) {
        return { ...student, Status: "Activated" };
      }

      return student;
    });
    setStudentTableData(updateData);

    const selectedEnrollmentIds = [];
    selectedRows.forEach((row) => selectedEnrollmentIds.push(row.EnrollmentId));

    try {
      const response = await api.put(
        "/students/activateAllStudents",
        selectedEnrollmentIds
      );
      if (response.data) {
        // students.forEach((student) => (student.status = 1));
        // setStudents(students);
        // fetchAllUsers();
        toast.success("All students Allow to login");
      }
    } catch (error) {
      toast.error("Error while Activate All Students");
      console.log("Error while Activate All Students", error);
    }
  };

  //suspendAllStudents
  const suspendAllStudents = async () => {
    if (!gridApi) return;
    const selectedRows = gridApi.getSelectedRows();

    if (selectedRows.length === 0) {
      toast.info("Please select row to suspend");
      return;
    }

    const updateData = studentTableData.map((student) => {
      if (
        selectedRows.some(
          (selected) => selected.EnrollmentId === student.EnrollmentId
        )
      ) {
        return { ...student, Status: "Suspended" };
      }
      return student;
    });
    setStudentTableData(updateData);

    const selectedEnrollmentIds = [];
    selectedRows.forEach((row) => selectedEnrollmentIds.push(row.EnrollmentId));

    try {
      const response = await api.put(
        "/students/suspendAllStudents",
        selectedEnrollmentIds
      );
      if (response.data) {
        // students.forEach((student) => (student.status = 0));
        // setStudents(students);
        fetchAllUsers();
        toast.success("All students suspended");
      }
    } catch (error) {
      toast.error("Error while Suspend All Students");
      console.log("Error while Suspend All Students", error);
    }
  };

  //deleteAllStudents
  const deleteAllStudents = async () => {
    if (!gridApi) return;
    const selectedRows = gridApi.getSelectedRows();
    if (selectedRows === 0) {
      toast.info("Please select students for delete");
      return;
    }
    const selectedEnrollmentIds = selectedRows.map(
      (student) => student.EnrollmentId
    );
    const updatedData = studentTableData.filter(
      (student) => !selectedEnrollmentIds.includes(student.EnrollmentId)
    );
    setStudentTableData(updatedData);
    try {
      const response = await api.put(
        "/students/deleteAllStudents",
        selectedEnrollmentIds
      );
      if (response.data) {
        setStudents([]);
        fetchAllUsers();
        fetchAllNoDuesStatus();
        toast.success("All students Deleted");
      }
    } catch (error) {
      toast.error("Error while deleting All Students");
      console.log("Error while deleting All Students", error);
    }
  };

  //activateAllAuthorities
  const activateAllAuthorities = async () => {
    try {
      const response = await api.put("/authority/activateAllAuthorities");
      if (response.data) {
        authorities.forEach((authority) => (authority.status = 1));
        setAuthorities(authorities);
        fetchAllUsers();
        fetchAllNoDuesStatus();
        toast.success("All authorities Activated");
      }
    } catch (error) {
      toast.error("Error while Activate All authorities");
      console.log("Error while Activate All authorities", error);
    }
  };

  //suspendAllAuthorities
  const suspendAllAuthorities = async () => {
    try {
      const response = await api.put("/authority/suspendAllAuthorities");
      if (response.data) {
        authorities.forEach((authority) => (authority.status = 0));
        setAuthorities(authorities);
        fetchAllUsers();
        fetchAllNoDuesStatus();
        toast.success("All authorities Suspended");
      }
    } catch (error) {
      toast.error("Error while Suspend All authorities");
      console.log("Error while Suspend All authorities", error);
    }
  };

  //deleteAllAuthorities
  const deleteAllAuthorities = async () => {
    try {
      const response = await api.put("/authority/deleteAllAuthorities");
      if (response.data) {
        setAuthorities([]);
        authoritiesFecthing();
        fetchAllUsers();
        fetchAllNoDuesStatus();
        setTotalUsers(totalUsers - totalAuthorities);
        setTotalAuthorities(0);
        toast.success("All authorities Deleted");
      }
    } catch (error) {
      toast.error("Error while deleting All authorities");
      console.log("Error while deleting All authorities", error);
    }
  };

  //addAuthority
  const saveAuthority = async (values, { resetForm }) => {
    const addAuthorityFormData = {
      name: values.name,
      email: values.email,
      password: values.password,
      designation: values.designation,
      phone_no: values.phone_no,
    };

    try {
      const response = await api.post(
        "/authority/addAuthority",
        addAuthorityFormData
      );

      if (response.data) {
        setAddAuthorityModal(false);
        authorities.push(addAuthorityFormData);
        setAuthorities(authorities);
        fetchAllUsers();
        fetchAllNoDuesStatus();
        toast.success("Authority added successfully 😊");
        resetForm();
      } else {
        toast.warn(values.email + " email already associated with other user");
      }
    } catch (error) {
      toast.error("Error while adding authority");
      console.log("Error while adding authority", error);
    }
  };

  //check valid user for profile updation
  const isValidUser = async () => {
    setVerifyPassord("");

    if (verifyPassword.trim().length == 0) {
      toast.info("Please enter Password");
      return;
    }

    try {
      const response = await api.get(
        `/user/verify/${admin.email}/${verifyPassword}`
      );

      if (response.status === 200 && response.data) {
        setVerifyUserModal(false);
        setEditProfileModal(true);
        setEditProfileFormData({password:verifyPassword});
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

    setVerifyPassord("");
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
      formData.append("email", admin.email); //user email whose data to be updated
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

        if (response.status === 200 && response.data) {
          fetchAllUsers();
          users
            .filter((user) => user.role === "ADMIN")
            .forEach((user) => {
              admin.email = user.email;
              admin.password = user.password;
              setAdmin(admin);
              // localStorage.setItem("admin", admin);
            });

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

  //initialvalues
  const initialValues = {
    name: "",
    email: "",
    password: "",
    confirmpassword: "",
    designation: "",
    phone_no: "",
  };

  //yup validations
  const validationSchema = Yup.object({
    name: Yup.string()
      .required()
      .min(3, " must be greater than 3 character")
      .max(16, " must be less than 16 character"),
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
    designation: Yup.string().required(),
    phone_no: Yup.number("It must be a number").required(),
  });

  //formik
  const { values, errors, touched, handleSubmit, handleChange, handleBlur } =
    useFormik({
      initialValues,
      validationSchema,
      onSubmit: saveAuthority,
    });

  if (loading) return <Loader/>
  else
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
                className="rounded-5 border border-3 "
                style={{ width: "40px", height: "40px" }}
                alt="Profile Picture"
              />
              <span className="navbar-brand fs-2">Admin Dashboard</span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-4 me-3">
            {/* Desktop View */}
            <div className="d-none d-md-flex align-items-center gap-3">
              <span
                className="text-light fs-5"
                onClick={() => setUserprofileModal(true)}
                style={{ cursor: "pointer" }}
              >
                {admin?.fullName || "Name"}
              </span>
              <Link type="button" className="btn btn-light btn-sm" to="/">
               🚪 LogOut
              </Link>
            </div>

            {/* Mobile View: 3-dot Dropdown */}
            <div className="dropdown d-md-none">
              <button
                className="btn btn-outline-light"
                type="button"
                id="adminDropdownButton"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                ⋮
              </button>
              <ul
                className="dropdown-menu dropdown-menu-end"
                aria-labelledby="adminDropdownButton"
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

        <div className="quick-actions d-flex justify-content-center gap-sm-2 mt-sm-4 mb-sm-4 ms-sm-2 me-sm-4">
          <h3>Quick Actions</h3>
          <button
            className="btn btn-primary"
            onClick={() => setAddAuthorityModal(true)}
          >
            Add Authority
          </button>
          <button className="btn btn-secondary">
            Upload Certificate Template
          </button>
          <button className="btn btn-success">Download Report</button>
          <button className="btn btn-warning">System Logs</button>
        </div>

        {/* Users data */}
        <div className="Authorities-actions d-flex flex-column mt-sm-2 mb-sm-4 ms-sm-2 me-sm-4">
          <h3 className="align-self-center">All Users</h3>

          <div className="table-responsive">
            <table className="table">
              <thead className="table-light">
                <tr>
                  <th scope="col">Status</th>
                  <th scope="col">Users</th>
                  <th scope="col">Students</th>
                  <th scope="col">Authorities</th>
                </tr>
              </thead>
              <tbody className="table-group-divider">
                <tr>
                  <th scope="row">Activated</th>
                  <td scope="col">
                    {users.filter((user) => user.verified).length}
                  </td>
                  <td scope="col">
                    {
                      studentTableData.filter(
                        (student) => student.Status == "Activated"
                      ).length
                    }
                  </td>
                  <td scope="col">
                    {
                      users.filter(
                        (user) => user.verified && user.role == "AUTHORITY"
                      ).length
                    }
                  </td>
                </tr>
                <tr>
                  <th scope="row">Suspended</th>
                  <td scope="col">
                    {users.filter((user) => !user.verified).length}
                  </td>
                  <td scope="col">
                    {
                      studentTableData.filter(
                        (student) => student.Status == "Suspended"
                      ).length
                    }
                  </td>
                  <td scope="col">
                    {
                      users.filter(
                        (user) => !user.verified && user.role == "AUTHORITY"
                      ).length
                    }
                  </td>
                </tr>
                <tr>
                  <th scope="row">Total</th>
                  <td scope="col">{users.length}</td>
                  <td scope="col">
                    {users.filter((user) => user.role == "STUDENT").length}
                  </td>
                  <td scope="col">
                    {users.filter((user) => user.role == "AUTHORITY").length}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* NoDues Status */}
        <div className="Authorities-actions d-flex flex-column mt-sm-2 mb-sm-4 ms-sm-2 me-sm-4">
          <h3 className="align-self-center">NoDues Status</h3>

          <div className="table-responsive">
            <table className="table">
              <thead className="table-light">
                <tr>
                  <th scope="col">Department</th>
                  <th scope="col">Approved Students</th>
                  <th scope="col">Rejected Students</th>
                  <th scope="col">Pending Requests</th>
                </tr>
              </thead>
              <tbody className="table-group-divider">
                {result.map((row, index) => (
                  <tr key={index}>
                    <td>{row.designation}</td>
                    <td>{row.approved}</td>
                    <td>{row.rejected}</td>
                    <td>{row.pending}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Authority table */}
        <div className="Authorities-actions d-flex flex-column mt-sm-2 mb-sm-4 ms-sm-2 me-sm-4 pt-3 pb-3">
          <div className="d-flex justify-content-between align-items-center">
            <h3 className=" align-self-center">All Authorities</h3>
            <div className="d-flex gap-lg-3 gap-sm-3 align-items-center">
              <button
                className="btn btn-success"
                onClick={() => activateAllAuthorities()}
              >
                Activate All
              </button>
              <button
                className="btn btn-warning"
                onClick={() => setSuspendAllAuthorityModal(true)}
              >
                Suspend All
              </button>
              <button
                className="btn btn-danger me-3"
                onClick={() => setDeleteAllAuthorityModal(true)}
              >
                Delete All
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead className="table-light">
                <tr>
                  <th scope="col">S.NO</th>
                  <th scope="col">Name</th>
                  <th scope="col">Designation</th>
                  <th scope="col">Email</th>
                  <th scope="col">Phone No</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody className="table-group-divider">
                {authorities.map((authority, index) => (
                  <tr key={index}>
                    <th scope="row">{index + 1}</th>
                    <td>{authority.name}</td>
                    <td>{authority.designation}</td>
                    <td>{authority.email}</td>
                    <td>{authority.phone_no}</td>
                    <td>{authority.status == 1 ? "Active" : "Suspended"}</td>
                    <td>
                      <button
                        className="btn btn-success me-lg-3"
                        onClick={() => {
                          toggleAuthorityStatus(authority.email);
                        }}
                      >
                        {authority.status == 0 ? "Activate" : "Suspend"}
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => deleteAuthority(authority.email)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* All Students */}
        <div className="d-flex justify-content-between align-items-center">
          <h3 className=" align-self-center">All Students</h3>
          <div className="d-flex gap-lg-3 gap-sm-3 align-items-center">
            <button
              className="btn btn-success"
              onClick={() => activateAllStudents()}
            >
              Activate All
            </button>
            <button
              className="btn btn-warning"
              onClick={() => suspendAllStudents()}
            >
              Suspend All
            </button>
            <button
              className="btn btn-danger me-3"
              onClick={() => setDeleteAllStudentModal(true)}
            >
              Delete All
            </button>
          </div>
        </div>
        <div
          className="ag-theme-alpine"
          style={{ height: "500px", width: "100%" }}
        >
          <AgGridReact
            rowData={studentTableData}
            columnDefs={studentTableColumnDefinition}
            rowSelection="multiple"
            onGridReady={(params) => setGridApi(params.api)}
            getRowId={(params) => params.data.EnrollmentId}
            paginationPageSize={10}
            pagination={true}
            groupDisplayType="groupRows"
            animateRows={true}
            autoGroupColumnDef={{
              headerName: "Branch Group",
              cellRendererParams: {
                suppressCount: false,
              },
            }}
          />
        </div>

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

        {/*Admin Profile modal  */}
        <Modal
          show={userProfileModal}
          onHide={() => setUserprofileModal(false)}
          centered
        >
          {users
            .filter((user) => user.role === "ADMIN")
            .map((admin, index) => (
              <div
                key={index}
                className="container mt-5 mb-5 d-flex justify-content-center"
              >
                <div className="card shadow-lg rounded-4 pt-4">
                  <div className="text-center w-100 h-5">
                    <img
                      src={
                        admin.profile_picture_url
                          ? admin.profile_picture_url
                          : "/src/assets/dummyProfile.png"
                      }
                      className="rounded-circle border border-3 border-success w-50 h-75 "
                      alt="Profile Picture"
                    />
                  </div>
                  <h4 className="text-center fw-bold mb-3" id="userName">
                    {admin.fullName}
                  </h4>

                  <ul className="list-group list-group-flush">
                    <li className="list-group-item d-flex justify-content-between">
                      <strong>Email:</strong>{" "}
                      <span id="userEmail">{admin.email}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <strong>Password:</strong> <span>********</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <strong>Role:</strong>{" "}
                      <span id="userRole">{admin.role}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <strong>Status:</strong>
                      <span className="badge bg-success" id="userStatus">
                        {admin.verified ? "Active" : "Deactivate"}
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
            ))}
        </Modal>

        {/* Verify User Modal */}
        <Modal show={verifyUserModal} onHide={() => setVerifyUserModal(false)}>
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
                onChange={(e) => setVerifyPassord(e.target.value)}
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
                setVerifyPassord("");
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
                  // placeholder="Enter name"
                  value={
                    editProfileFormData.fullName.trim() == ""
                      ? admin.fullName
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
                      ? admin.email
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
                      ? admin.phoneNo
                      : editProfileFormData.phoneNo
                  }
                  onChange={(e) =>
                    setEditProfileFormData({
                      ...editProfileFormData,
                      phone_no: e.target.value,
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

        {/* Form Modal for adding authority*/}
        <Modal
          centered
          show={addAuthorityModal}
          onHide={() => setAddAuthorityModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Add New Authority</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter name"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.name && touched.name ? (
                  <span className="text-danger">{errors.name}</span>
                ) : null}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.email && touched.email ? (
                  <span className="text-danger">{errors.email}</span>
                ) : null}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  autoComplete="off"
                  type="password"
                  placeholder="Password@123"
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.password && touched.password ? (
                  <span className="text-danger">{errors.password}</span>
                ) : null}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  autoComplete="off"
                  type="password"
                  placeholder="Password@123"
                  name="confirmpassword"
                  value={values.confirmpassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.confirmpassword && touched.confirmpassword ? (
                  <span className="text-danger">{errors.confirmpassword}</span>
                ) : null}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Designation</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Designation"
                  name="designation"
                  value={values.designation}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.designation && touched.designation ? (
                  <span className="text-danger">{errors.designation}</span>
                ) : null}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Phone No</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter Phone No"
                  name="phone_no"
                  value={values.phone_no}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.phone_no && touched.phone_no ? (
                  <span className="text-danger">{errors.phone_no}</span>
                ) : null}
              </Form.Group>

              <Button variant="secondary" className="me-4">
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Suspend All Authority Modal*/}
        <Modal
          centered
          show={suspendAllAuthorityModal}
          onHide={() => setSuspendAllAuthorityModal(false)}
        >
          <div className="d-flex flex-column justify-content-center align-content-center m-5">
            <h3>Confirm Suspend 🥲</h3>
            <h5>
              If you suspend all authorities all Students No Dues Status will be
              Deleted they are not automatically created on activation of
              authorities and they need to apply again for no dues
            </h5>
            <p>Are you sure you want to suspend all the Authorities ?</p>
            <div className="d-flex gap-4">
              <Button
                variant="danger"
                onClick={() => {
                  suspendAllAuthorities();
                  setSuspendAllAuthorityModal(false);
                }}
              >
                Suspend
              </Button>
              <Button onClick={() => setSuspendAllAuthorityModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete All Authority Modal*/}
        <Modal
          centered
          show={deleteAllAuthorityModal}
          onHide={() => setDeleteAllAuthorityModal(false)}
        >
          <div className="d-flex flex-column justify-content-center align-content-center m-5">
            <h3>Confirm Deletion 🥲</h3>
            <p>Are you sure you want to delete this All Authorities ?</p>
            <div className="d-flex gap-4">
              <Button
                variant="danger"
                onClick={() => {
                  deleteAllAuthorities();
                  setDeleteAllAuthorityModal(false);
                }}
              >
                Yes
              </Button>
              <Button onClick={() => setDeleteAllAuthorityModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete All Students Modal*/}
        <Modal
          centered
          show={deleteAllStudentModal}
          onHide={() => setDeleteAllStudentModal(false)}
        >
          <div className="d-flex flex-column justify-content-center align-content-center m-5">
            <h3>🥲Confirm Deletion</h3>
            <p>Are you sure you want to delete this All Students ?</p>
            <div className="d-flex gap-4">
              <Button
                variant="danger"
                onClick={() => {
                  deleteAllStudents();
                  setDeleteAllStudentModal(false);
                }}
              >
                Yes
              </Button>
              <Button onClick={() => setDeleteAllStudentModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
};
export default AdminDashboard;
